const _ = require('lodash');
const get = require('get-value');
const {
  getCatalogEndpoint,
  identifyDeviceAction,
  identifyBrowserAction,
  identifyAction,
  pageAction,
  screenAction,
  trackAction,
  trackPurchaseAction,
  updateCartAction,
} = require('./util');
const { EventType, MappedToDestinationKey } = require('../../../constants');
const {
  ConfigCategory,
  mappingConfig,
  IDENTIFY_BATCH_ENDPOINT,
  TRACK_BATCH_ENDPOINT,
  IDENTIFY_MAX_BATCH_SIZE,
  TRACK_MAX_BATCH_SIZE,
} = require('./config');
const {
  removeUndefinedValues,
  defaultPostRequestConfig,
  defaultBatchRequestConfig,
  defaultRequestConfig,
  constructPayload,
  getSuccessRespEvents,
  handleRtTfSingleEventError,
  checkInvalidRtTfEvents,
  getDestinationExternalIDInfoForRetl,
} = require('../../util');
const logger = require('../../../logger');
const { InstrumentationError } = require('../../util/errorTypes');
const { JSON_MIME_TYPE } = require('../../util/constant');

function constructPayloadItem(message, category, destination) {
  let rawPayload = {};

  switch (category.action) {
    case 'identifyDevice':
      rawPayload = identifyDeviceAction(message, destination.Config);
      break;
    case 'identifyBrowser':
      rawPayload = identifyBrowserAction(message);
      break;
    case 'identify':
      rawPayload = identifyAction(message, category, destination.Config);
      break;
    case 'page':
      rawPayload = pageAction(message, destination, category);
      break;
    case 'screen':
      rawPayload = screenAction(message, destination, category);
      break;
    case 'track':
      rawPayload = trackAction(message, category);
      break;
    case 'trackPurchase':
      rawPayload = trackPurchaseAction(message, category, destination.Config);
      break;
    case 'updateCart':
      rawPayload = updateCartAction(message, destination.Config);
      break;
    case 'alias':
      rawPayload = constructPayload(message, mappingConfig[category.name]);
      break;
    case 'catalogs':
      rawPayload = constructPayload(message, mappingConfig[category.name]);
      break;
    default:
      logger.debug('not supported type');
  }

  return removeUndefinedValues(rawPayload);
}

function responseBuilderSimple(message, category, destination) {
  const response = defaultRequestConfig();
  response.endpoint =
    category.action === 'catalogs' ? getCatalogEndpoint(category, message) : category.endpoint;
  response.method = defaultPostRequestConfig.requestMethod;
  response.body.JSON = constructPayloadItem(message, category, destination);
  // adding operation to understand what type of event will be sent in batch
  if (category.action === 'catalogs') {
    response.operation = 'catalogs';
  }
  response.headers = {
    'Content-Type': JSON_MIME_TYPE,
    api_key: destination.Config.apiKey,
  };
  return response;
}

function responseBuilderSimpleForIdentify(message, category, destination) {
  const response = defaultRequestConfig();
  const { os, device } = message.context;

  if (device) {
    response.endpoint = category.endpointDevice;
    response.body.JSON = constructPayloadItem(
      message,
      { ...category, action: category.actionDevice },
      destination,
    );
  } else if (os) {
    response.endpoint = category.endpointBrowser;
    response.body.JSON = constructPayloadItem(
      message,
      { ...category, action: category.actionBrowser },
      destination,
    );
  }

  response.headers = {
    'Content-Type': JSON_MIME_TYPE,
    api_key: destination.Config.apiKey,
  };
  return response;
}

function getCategoryUsingEventName(event) {
  let category;
  switch (event) {
    case 'order completed':
      category = ConfigCategory.TRACK_PURCHASE;
      break;
    case 'product added':
    case 'product removed':
      category = ConfigCategory.UPDATE_CART;
      break;
    default:
      category = ConfigCategory.TRACK;
  }
  return category;
}

function processSingleMessage(message, destination) {
  const messageType = message.type.toLowerCase();
  let category = {};
  let event;
  switch (messageType) {
    case EventType.IDENTIFY:
      if (
        get(message, MappedToDestinationKey) &&
        getDestinationExternalIDInfoForRetl(message, 'ITERABLE').objectType !== 'users'
      ) {
        // catagory will be catalog for any other object other than users
        // DOC: https://support.iterable.com/hc/en-us/articles/360033214932-Catalog-Overview
        category = ConfigCategory.CATALOG;
      } else {
        category = ConfigCategory.IDENTIFY;
      }
      break;
    case EventType.PAGE:
      category = ConfigCategory.PAGE;
      break;
    case EventType.SCREEN:
      category = ConfigCategory.SCREEN;
      break;
    case EventType.TRACK:
      event = message.event?.toLowerCase();
      category = getCategoryUsingEventName(event);
      break;
    case EventType.ALIAS:
      category = ConfigCategory.ALIAS;
      break;
    default:
      throw new InstrumentationError(`Message type ${messageType} not supported`);
  }
  const response = responseBuilderSimple(message, category, destination);

  if (
    message.type === EventType.IDENTIFY &&
    message.context &&
    ((message.context.device && message.context.device.token) ||
      (message.context.os && message.context.os.token))
  ) {
    return [response, responseBuilderSimpleForIdentify(message, category, destination)];
  }

  return response;
}

function process(event) {
  return processSingleMessage(event.message, event.destination);
}

function batchEvents(arrayChunks) {
  const batchedResponseList = [];

  // list of chunks [ [..], [..] ]
  arrayChunks.forEach((chunk) => {
    const batchResponseList = [];
    const metadatas = [];
    // DOC: https://api.iterable.com/api/docs#catalogs_bulkUpdateCatalogItems
    const batchCatalogResponseList = {
      documents: {},
      replaceUploadedFieldsOnly: true,
    };

    // extracting destination
    // from the first event in a batch
    const { destination } = chunk[0];
    const { apiKey } = destination.Config;

    let batchEventResponse = defaultBatchRequestConfig();

    // Batch event into dest batch structure
    chunk.forEach((ev) => {
      if (chunk[0].message.operation === 'catalogs') {
        // body will be in the format:
        //   {
        //     "documents": {
        //         "test-1-item": {
        //             "abc": "TestValue"
        //         },
        //         "test-2-item": {
        //             "abc": "TestValue1"
        //         }
        //     },
        //     "replaceUploadedFieldsOnly": true
        // }
        batchCatalogResponseList.documents[ev.message.endpoint.split('/').pop()] = get(
          ev,
          'message.body.JSON.update',
        );
      }
      batchResponseList.push(get(ev, 'message.body.JSON'));
      metadatas.push(ev.metadata);
    });
    // batching into identify batch structure
    if (chunk[0].message.operation === 'catalogs') {
      batchEventResponse.batchedRequest.body.JSON = batchCatalogResponseList;
      batchEventResponse.batchedRequest.endpoint = chunk[0].message.endpoint.substr(
        0,
        chunk[0].message.endpoint.lastIndexOf('/'),
      );
    } else if (chunk[0].message.endpoint.includes('/api/users')) {
      batchEventResponse.batchedRequest.body.JSON = {
        users: batchResponseList,
      };
      batchEventResponse.batchedRequest.endpoint = IDENTIFY_BATCH_ENDPOINT;
    } else {
      // batching into track batch structure
      batchEventResponse.batchedRequest.body.JSON = {
        events: batchResponseList,
      };
      batchEventResponse.batchedRequest.endpoint = TRACK_BATCH_ENDPOINT;
    }

    batchEventResponse.batchedRequest.headers = {
      'Content-Type': JSON_MIME_TYPE,
      api_key: apiKey,
    };

    batchEventResponse = {
      ...batchEventResponse,
      metadata: metadatas,
      destination,
    };
    batchedResponseList.push(
      getSuccessRespEvents(
        batchEventResponse.batchedRequest,
        batchEventResponse.metadata,
        batchEventResponse.destination,
        true,
      ),
    );
  });

  return batchedResponseList;
}

function getEventChunks(event, identifyEventChunks, trackEventChunks, eventResponseList) {
  // Categorizing identify and track type of events
  // Checking if it is identify type event
  if (
    event.message.endpoint === ConfigCategory.IDENTIFY.endpoint ||
    event.message.operation === 'catalogs'
  ) {
    identifyEventChunks.push(event);
  } else if (event.message?.endpoint?.includes('api/events/track')) {
    // Checking if it is track type of event
    trackEventChunks.push(event);
  } else {
    // any other type of event
    const { message, metadata, destination } = event;
    const endpoint = get(message, 'endpoint');
    if (Array.isArray(message)) {
      eventResponseList.push(getSuccessRespEvents(message, [metadata], destination));
    } else {
      const batchedResponse = defaultBatchRequestConfig();
      batchedResponse.batchedRequest.headers = message.headers;
      batchedResponse.batchedRequest.endpoint = endpoint;
      batchedResponse.batchedRequest.body = message.body;
      batchedResponse.batchedRequest.params = message.params;
      batchedResponse.batchedRequest.method = defaultPostRequestConfig.requestMethod;
      batchedResponse.metadata = [metadata];
      batchedResponse.destination = destination;

      eventResponseList.push(
        getSuccessRespEvents(
          batchedResponse.batchedRequest,
          batchedResponse.metadata,
          batchedResponse.destination,
        ),
      );
    }
  }
}

const processRouterDest = async (inputs, reqMetadata) => {
  const errorRespEvents = checkInvalidRtTfEvents(inputs);
  if (errorRespEvents.length > 0) {
    return errorRespEvents;
  }

  const identifyEventChunks = []; // list containing identify events in batched format
  const trackEventChunks = []; // list containing track events in batched format
  const eventResponseList = []; // list containing other events in batched format
  const errorRespList = [];
  await Promise.all(
    inputs.map(async (event) => {
      try {
        if (event.message.statusCode) {
          // already transformed event
          getEventChunks(event, identifyEventChunks, trackEventChunks, eventResponseList);
        } else {
          // if not transformed
          getEventChunks(
            {
              message: await process(event),
              metadata: event.metadata,
              destination: event.destination,
            },
            identifyEventChunks,
            trackEventChunks,
            eventResponseList,
          );
        }
      } catch (error) {
        const errRespEvent = handleRtTfSingleEventError(event, error, reqMetadata);
        errorRespList.push(errRespEvent);
      }
    }),
  );

  // batching identifyArrayChunks
  let identifyBatchedResponseList = [];
  if (identifyEventChunks.length > 0) {
    // arrayChunks = [[e1,e2,e3,..batchSize],[e1,e2,e3,..batchSize]..]
    // transformed payload of (n) batch size
    const identifyArrayChunks = _.chunk(identifyEventChunks, IDENTIFY_MAX_BATCH_SIZE);
    identifyBatchedResponseList = batchEvents(identifyArrayChunks);
  }
  // batching TrackArrayChunks
  let trackBatchedResponseList = [];
  if (trackEventChunks.length > 0) {
    // arrayChunks = [[e1,e2,e3,..batchSize],[e1,e2,e3,..batchSize]..]
    // transformed payload of (n) batch size
    const trackArrayChunks = _.chunk(trackEventChunks, TRACK_MAX_BATCH_SIZE);
    trackBatchedResponseList = batchEvents(trackArrayChunks);
  }
  let batchedResponseList = [];
  // appending all kinds of batches
  batchedResponseList = batchedResponseList
    .concat(identifyBatchedResponseList)
    .concat(trackBatchedResponseList)
    .concat(eventResponseList);

  return [...batchedResponseList, ...errorRespList];
};

module.exports = { process, processRouterDest };
