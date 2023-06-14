const _ = require('lodash');
const get = require('get-value');
const jsonSize = require('json-size');
const {
  isAppleFamily,
  constructPayload,
  getSuccessRespEvents,
  addExternalIdToTraits,
  defaultBatchRequestConfig,
  getDestinationExternalIDInfoForRetl,
} = require('../../util');
const {
  ConfigCategory,
  mappingConfig,
  TRACK_MAX_BATCH_SIZE,
  TRACK_BATCH_ENDPOINT,
  IDENTIFY_MAX_BATCH_SIZE,
  IDENTIFY_BATCH_ENDPOINT,
  IDENTIFY_MAX_BODY_SIZE_IN_BYTES,
} = require('./config');
const { JSON_MIME_TYPE } = require('../../util/constant');
const { EventType, MappedToDestinationKey } = require('../../../constants');
const { InstrumentationError, ConfigurationError } = require('../../util/errorTypes');

/**
 * Function to prepare catalog event endpoint
 * @param {*} category
 * @param {*} message
 * @returns
 */
const getCatalogEndpoint = (category, message) => {
  const externalIdInfo = getDestinationExternalIDInfoForRetl(message, 'ITERABLE');
  return `${category.endpoint}/${externalIdInfo.objectType}/items`;
};

/**
 * Validation for email and userId
 * It will throw an error if any one is not found in payload
 * @param {*} payload
 */
const validateMandatoryField = (payload) => {
  if (payload.email === undefined && payload.userId === undefined) {
    throw new InstrumentationError('userId or email is mandatory for this request');
  }
};

/**
 * Check for register device and register browser events
 * @param {*} message
 * @param {*} category
 * @returns
 */
const hasMultipleResponses = (message, category) => {
  const { context } = message;
  return (
    message.type === EventType.IDENTIFY &&
    category === ConfigCategory.IDENTIFY &&
    context &&
    ((context.device && context.device.token) || (context.os && context.os.token))
  );
};

/**
 * Returns category value
 * @param {*} message
 * @returns
 */
const getCategoryUsingEventName = (message) => {
  const event = message.event?.toLowerCase();

  switch (event) {
    case 'order completed':
      return ConfigCategory.TRACK_PURCHASE;
    case 'product added':
    case 'product removed':
      return ConfigCategory.UPDATE_CART;
    default:
      return ConfigCategory.TRACK;
  }
};

/**
 * Prepares register device token event payload
 * @param {*} message
 * @returns
 */
const registerDeviceTokenEventPayloadBuilder = (message) => {
  const rawPayload = {
    ...constructPayload(message, mappingConfig[ConfigCategory.IDENTIFY_DEVICE.name]),
    preferUserId: true,
    device: {
      ...constructPayload(message, mappingConfig[ConfigCategory.DEVICE.name]),
      platform: isAppleFamily(message.context.device.type) ? 'APNS' : 'GCM',
    },
  };

  return rawPayload;
};

/**
 * Prepares register browser token event payload
 * @param {*} message
 * @returns
 */
const registerBrowserTokenEventPayloadBuilder = (message) => {
  const rawPayload = constructPayload(message, mappingConfig[ConfigCategory.IDENTIFY_BROWSER.name]);
  validateMandatoryField(rawPayload);
  return rawPayload;
};

/**
 * Prepares identify event payload
 * @param {*} message
 * @param {*} category
 * @returns
 */
const updateUserEventPayloadBuilder = (message, category) => {
  // If mapped to destination, Add externalId to traits
  if (get(message, MappedToDestinationKey)) {
    addExternalIdToTraits(message);
  }

  const rawPayload = {
    ...constructPayload(message, mappingConfig[category.name]),
    preferUserId: true,
    mergeNestedObjects: true,
  };

  validateMandatoryField(rawPayload);
  return rawPayload;
};

/**
 * Common function to build screen or page event payload
 * @param {*} message
 * @param {*} destination
 * @param {*} category
 * @returns
 */
const pageOrScreenEventPayloadBuilder = (message, destination, category) => {
  let rawPayload = {};
  const eventType = message.type.toLowerCase();

  const { trackAllPages, trackCategorisedPages, trackNamedPages } = destination.Config;
  if (trackAllPages) {
    rawPayload = constructPayload(message, mappingConfig[category.name]);
  } else if (trackCategorisedPages && (message.properties?.category || message.category)) {
    rawPayload = constructPayload(message, mappingConfig[category.name]);
  } else if (trackNamedPages && (message.properties?.name || message.name)) {
    rawPayload = constructPayload(message, mappingConfig[category.name]);
  } else {
    throw new ConfigurationError(`Invalid ${eventType} call`);
  }

  validateMandatoryField(rawPayload);

  rawPayload.createdAt = new Date(rawPayload.createdAt).getTime();
  rawPayload.campaignId = rawPayload.campaignId ? parseInt(rawPayload.campaignId, 10) : undefined;
  rawPayload.templateId = rawPayload.templateId ? parseInt(rawPayload.templateId, 10) : undefined;
  rawPayload.eventName =
    destination.Config.mapToSingleEvent === true
      ? `Loaded a ${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`
      : `${rawPayload.eventName} ${eventType}`;

  return rawPayload;
};

/**
 * Prepares page event payload
 * @param {*} message 
 * @param {*} destination 
 * @param {*} category 
 * @returns 
 */
const pageEventPayloadBuilder = (message, destination, category) => pageOrScreenEventPayloadBuilder(message, destination, category);

/**
 * Prepares screen event payload
 * @param {*} message 
 * @param {*} destination 
 * @param {*} category 
 * @returns 
 */
const screenEventPayloadBuilder = (message, destination, category) =>
  pageOrScreenEventPayloadBuilder(message, destination, category);

/**
 * Prepares track event payload
 * @param {*} message
 * @param {*} category
 * @returns
 */
const trackEventPayloadBuilder = (message, category) => {
  const rawPayload = constructPayload(message, mappingConfig[category.name]);

  validateMandatoryField(rawPayload);

  rawPayload.createdAt = new Date(rawPayload.createdAt).getTime();
  rawPayload.campaignId = rawPayload.campaignId ? parseInt(rawPayload.campaignId, 10) : undefined;
  rawPayload.templateId = rawPayload.templateId ? parseInt(rawPayload.templateId, 10) : undefined;

  return rawPayload;
};

/**
 * Prepares products transformed payload array
 * @param {*} message
 * @returns
 */
const prepareProductPayloadArray = (message) => {
  const rawPayloadProductsArr = [];
  const products = Array.isArray(message.properties?.products)
    ? message.properties.products
    : [message.properties];

  products.forEach((product) => {
    const productPayload = constructPayload(product, mappingConfig[ConfigCategory.PRODUCT.name]);

    if (productPayload.categories && typeof productPayload.categories === 'string') {
      productPayload.categories = productPayload.categories.split(',');
    }

    productPayload.price = parseFloat(productPayload.price);
    productPayload.quantity = parseInt(productPayload.quantity, 10);
    const productPayloadClone = { ...productPayload };
    rawPayloadProductsArr.push(productPayloadClone);
  });
  return rawPayloadProductsArr;
};

/**
 * Prepares purchase action event payload
 * @param {*} message
 * @param {*} category
 * @returns
 */
const purchaseEventPayloadBuilder = (message, category) => {
  const rawPayload = constructPayload(message, mappingConfig[category.name]);
  rawPayload.user = constructPayload(message, mappingConfig[ConfigCategory.IDENTIFY.name]);

  validateMandatoryField(rawPayload.user);

  rawPayload.user.preferUserId = true;
  rawPayload.user.mergeNestedObjects = true;
  rawPayload.total = parseFloat(rawPayload.total);
  rawPayload.items = prepareProductPayloadArray(message);
  rawPayload.createdAt = new Date(rawPayload.createdAt).getTime();
  rawPayload.id = rawPayload.id ? rawPayload.id.toString() : undefined;
  rawPayload.campaignId = rawPayload.campaignId ? parseInt(rawPayload.campaignId, 10) : undefined;
  rawPayload.templateId = rawPayload.templateId ? parseInt(rawPayload.templateId, 10) : undefined;

  return rawPayload;
};

/**
 * Prepares update cart action event payload
 * @param {*} message
 * @returns
 */
const updateCartEventPayloadBuilder = (message) => {
  const rawPayload = {
    user: constructPayload(message, mappingConfig[ConfigCategory.IDENTIFY.name]),
  };

  validateMandatoryField(rawPayload.user);

  rawPayload.user.preferUserId = true;
  rawPayload.user.mergeNestedObjects = true;
  rawPayload.items = prepareProductPayloadArray(message);

  return rawPayload;
};

/**
 * Combines batched and non batched requests
 * @param {*} apiKey
 * @param {*} metadata
 * @param {*} endPoint
 * @param {*} destination
 * @param {*} eventResponse
 * @param {*} transformedEvents
 * @returns
 */
const combineBatchedAndNonBatchedEvents = (
  apiKey,
  metadata,
  endPoint,
  destination,
  eventResponse,
  nonBatchedRequests,
) => {
  const { batchedRequest } = eventResponse;
  batchedRequest.endpoint = endPoint;
  batchedRequest.headers = {
    'Content-Type': JSON_MIME_TYPE,
    api_key: apiKey,
  };

  const batchedEvents =
    nonBatchedRequests.length > 0 ? [batchedRequest, ...nonBatchedRequests] : batchedRequest;

  const batchEventResponse = {
    events: batchedEvents,
    metadata,
    destination,
  };

  return getSuccessRespEvents(
    batchEventResponse.events,
    batchEventResponse.metadata,
    batchEventResponse.destination,
    true,
  );
};

/**
 * This function prepares and splits update user batches based on payload size
 * @param {*} chunk
 * @param {*} registerDeviceOrBrowserTokenEvents
 * @returns
 */
const prepareAndSplitUpdateUserBatchesBasedOnPayloadSize = (
  chunk,
  registerDeviceOrBrowserTokenEvents,
) => {
  const batches = [];
  let size = 0;
  let usersChunk = [];
  let metadataChunk = [];
  let nonBatchedRequests = [];

  chunk.forEach((event) => {
    size += jsonSize(get(event, 'message.body.JSON'));

    if (size > IDENTIFY_MAX_BODY_SIZE_IN_BYTES) {
      batches.push({
        users: usersChunk,
        metadata: metadataChunk,
        nonBatchedRequests,
        destination: event.destination,
      });

      usersChunk = [];
      metadataChunk = [];
      nonBatchedRequests = [];
      size = jsonSize(get(event, 'message.body.JSON'));
    }

    if (registerDeviceOrBrowserTokenEvents[event?.metadata?.jobId]) {
      const response = registerDeviceOrBrowserTokenEvents[event.metadata.jobId];
      nonBatchedRequests.push(response);
    }

    metadataChunk.push(event.metadata);
    usersChunk.push(get(event, 'message.body.JSON'));
  });

  if (usersChunk.length > 0) {
    batches.push({
      users: usersChunk,
      metadata: metadataChunk,
      nonBatchedRequests,
      destination: chunk[0].destination,
    });
  }

  return batches;
};

/**
 * Takes updateUser event chunks, divides them into smaller batches based on payload size
 * extracts user data and metadata from each event
 * and prepares batched responses for further processing
 * @param {*} updateUserEventsChunks
 * @param {*} registerDeviceOrBrowserEvents
 * @returns
 */
const processUpdateUserBatch = (chunk, registerDeviceOrBrowserTokenEvents) => {
  const batchedResponseList = [];

  const batches = prepareAndSplitUpdateUserBatchesBasedOnPayloadSize(
    chunk,
    registerDeviceOrBrowserTokenEvents,
  );

  batches.forEach((batch) => {
    const batchEventResponse = defaultBatchRequestConfig();
    batchEventResponse.batchedRequest.body.JSON = { users: batch.users };

    const { destination, metadata, nonBatchedRequests } = batch;
    const { apiKey } = destination.Config;

    const batchedResponse = combineBatchedAndNonBatchedEvents(
      apiKey,
      metadata,
      IDENTIFY_BATCH_ENDPOINT,
      destination,
      batchEventResponse,
      nonBatchedRequests,
    );

    batchedResponseList.push(batchedResponse);
  });

  return batchedResponseList;
};

/**
 * Takes a list of update user events and batches them into chunks, preparing them for batch processing
 * @param {*} updateUserEvents
 * @param {*} registerDeviceOrBrowserTokenEvents
 * @returns
 */
const batchUpdateUserEvents = (updateUserEvents, registerDeviceOrBrowserTokenEvents) => {
  // Batching update user events
  // arrayChunks = [[e1,e2,e3,..batchSize],[e1,e2,e3,..batchSize]..]
  const updateUserEventsChunks = _.chunk(updateUserEvents, IDENTIFY_MAX_BATCH_SIZE);
  return updateUserEventsChunks.reduce((batchedResponseList, chunk) => {
    const batchedResponse = processUpdateUserBatch(chunk, registerDeviceOrBrowserTokenEvents);
    return batchedResponseList.concat(batchedResponse);
  }, []);
};

/**
 * Processes chunks of catalog events, extracts the necessary data, and prepares batched requests for further processing
 * @param {*} catalogEventsChunks
 * @returns
 */
const processCatalogBatch = (chunk) => {
  const metadata = [];
  const batchCatalogResponseList = {
    documents: {},
    replaceUploadedFieldsOnly: true,
  };

  const { destination } = chunk[0];
  const { apiKey } = destination.Config;

  chunk.forEach((event) => {
    metadata.push(event.metadata);
    const catalogId = get(event, 'message.body.JSON.catalogId');
    const update = get(event, 'message.body.JSON.update');
    batchCatalogResponseList.documents[catalogId] = update;
  });

  const batchEventResponse = defaultBatchRequestConfig();
  /**
   * body format:
      {
        "documents": {
            "test-1-item": {
                "abc": "TestValue0"
            },
            "test-2-item": {
                "abc": "TestValue1"
            }
        },
        "replaceUploadedFieldsOnly": true
      }
   */
  batchEventResponse.batchedRequest.body.JSON = batchCatalogResponseList;
  const endPoint = chunk[0].message.endpoint;

  return combineBatchedAndNonBatchedEvents(
    apiKey,
    metadata,
    endPoint,
    destination,
    batchEventResponse,
    [],
  );
};

/**
 * Takes a list of catalog events and batches them into chunks, preparing them for batch processing
 * @param {*} catalogEvents
 * @returns
 */
const batchCatalogEvents = (catalogEvents) => {
  // Batching catalog events
  // arrayChunks = [[e1,e2,e3,..batchSize],[e1,e2,e3,..batchSize]..]
  const catalogEventsChunks = _.chunk(catalogEvents, IDENTIFY_MAX_BATCH_SIZE);
  return catalogEventsChunks.reduce((batchedResponseList, chunk) => {
    const batchedResponse = processCatalogBatch(chunk);
    return batchedResponseList.concat(batchedResponse);
  }, []);
};

/**
 * Processes chunks of track events, extracts the necessary data, and prepares batched requests for further processing
 * @param {*} trackEventsChunks
 * @returns
 */
const processTrackBatch = (chunk) => {
  const events = [];
  const metadata = [];

  const { destination } = chunk[0];
  const { apiKey } = destination.Config;

  chunk.forEach((event) => {
    metadata.push(event.metadata);
    events.push(get(event, 'message.body.JSON'));
  });

  const batchEventResponse = defaultBatchRequestConfig();
  batchEventResponse.batchedRequest.body.JSON = {
    events,
  };

  return combineBatchedAndNonBatchedEvents(
    apiKey,
    metadata,
    TRACK_BATCH_ENDPOINT,
    destination,
    batchEventResponse,
    [],
  );
};

/**
 * Takes a list of track events and batches them into chunks, preparing them for batch processing
 * @param {*} trackEvents
 * @returns
 */
const batchTrackEvents = (trackEvents) => {
  // Batching track events
  // arrayChunks = [[e1,e2,e3,..batchSize],[e1,e2,e3,..batchSize]..]
  const trackEventsChunks = _.chunk(trackEvents, TRACK_MAX_BATCH_SIZE);
  return trackEventsChunks.reduce((batchedResponseList, chunk) => {
    const batchedResponse = processTrackBatch(chunk);
    return batchedResponseList.concat(batchedResponse);
  }, []);
};

/**
 * Batch and prepare various types of events (track, catalog, updateUser) for processing in a modular and organized manner
 * @param {*} filteredEvents
 * @returns
 */
const prepareBatchRequests = (filteredEvents) => {
  const {
    trackEvents,
    catalogEvents,
    errorRespList,
    updateUserEvents,
    eventResponseList,
    registerDeviceOrBrowserTokenEvents,
  } = filteredEvents;

  const updateUserBatchedResponseList =
    updateUserEvents.length > 0
      ? batchUpdateUserEvents(updateUserEvents, registerDeviceOrBrowserTokenEvents)
      : [];

  const catalogBatchedResponseList =
    catalogEvents.length > 0 ? batchCatalogEvents(catalogEvents) : [];

  // Batching track events
  const trackBatchedResponseList = trackEvents.length > 0 ? batchTrackEvents(trackEvents) : [];

  // appending all kinds of batches
  const batchedResponseList = [
    ...updateUserBatchedResponseList,
    ...catalogBatchedResponseList,
    ...trackBatchedResponseList,
    ...eventResponseList,
  ];

  return [...batchedResponseList, ...errorRespList];
};

/**
 * This function creates an object by mapping events to their corresponding jobId
 * @param {*} events
 * @returns
 */
const mapRegisterDeviceOrBrowserTokenEventsWithJobId = (events) => {
  const registerDeviceOrBrowserTokenEvents = {};
  events.forEach((event) => {
    const { data } = event;
    registerDeviceOrBrowserTokenEvents[data?.metadata?.jobId] = data?.message;
  });
  return registerDeviceOrBrowserTokenEvents;
};

/**
 * Function to categorizes events.
 * @param {*} event
 * @returns
 */
const categorizeEvent = (event) => {
  const { message, metadata, destination } = event;

  if (event?.error) {
    return { type: 'error', data: event };
  }

  if (message.endpoint === ConfigCategory.IDENTIFY.endpoint) {
    return { type: 'updateUser', data: { message, metadata, destination } };
  }

  if (message.endpoint.includes('api/catalogs')) {
    return { type: 'catalog', data: { message, metadata, destination } };
  }

  if (
    message.endpoint === ConfigCategory.IDENTIFY_BROWSER.endpoint ||
    message.endpoint === ConfigCategory.IDENTIFY_DEVICE.endpoint
  ) {
    return { type: 'registerDeviceOrBrowser', data: { message, metadata, destination } };
  }

  if (message.endpoint.includes('api/events/track')) {
    return { type: 'track', data: { message, metadata, destination } };
  }

  return { type: 'eventResponse', data: getSuccessRespEvents(message, [metadata], destination) };
};

/**
 * Function to categorizes and filters events, organizing them into different arrays based on their properties
 * @param {*} transformedEvents
 */
const filterEvents = (transformedEvents) => {
  const categorizeEventList = transformedEvents.map(categorizeEvent);

  // Identify events
  const catalogEvents = categorizeEventList
    .filter((event) => event.type === 'catalog')
    .map((event) => event.data);
  const updateUserEvents = categorizeEventList
    .filter((event) => event.type === 'updateUser')
    .map((event) => event.data);
  const registerDeviceOrBrowserTokenEventsArray = categorizeEventList.filter(
    (event) => event.type === 'registerDeviceOrBrowser',
  );
  const registerDeviceOrBrowserTokenEvents = mapRegisterDeviceOrBrowserTokenEventsWithJobId(
    registerDeviceOrBrowserTokenEventsArray,
  );

  // Track events
  const trackEvents = categorizeEventList
    .filter((event) => event.type === 'track')
    .map((event) => event.data);

  // Rest of the events
  const eventResponseList = categorizeEventList
    .filter((event) => event.type === 'eventResponse')
    .map((event) => event.data);

  // Failed events
  const errorRespList = categorizeEventList
    .filter((event) => event.type === 'error')
    .map((event) => event.data);

  return {
    trackEvents,
    catalogEvents,
    errorRespList,
    updateUserEvents,
    eventResponseList,
    registerDeviceOrBrowserTokenEvents,
  };
};

/**
 * Function to prepare batch events and add it to final payload
 * @param {*} trackEvents
 * @returns
 */
const filterEventsAndPrepareBatchRequests = (transformedEvents) => {
  // Part 1 : filter events
  const filteredEvents = filterEvents(transformedEvents);

  // Part 2 : prepare batch requests
  return prepareBatchRequests(filteredEvents);
};

module.exports = {
  getCatalogEndpoint,
  hasMultipleResponses,
  pageEventPayloadBuilder,
  trackEventPayloadBuilder,
  screenEventPayloadBuilder,
  getCategoryUsingEventName,
  purchaseEventPayloadBuilder,
  updateCartEventPayloadBuilder,
  updateUserEventPayloadBuilder,
  pageOrScreenEventPayloadBuilder,
  filterEventsAndPrepareBatchRequests,
  registerDeviceTokenEventPayloadBuilder,
  registerBrowserTokenEventPayloadBuilder,
};
