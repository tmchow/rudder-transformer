const { defaultRequestConfig } = require('rudder-transformer-cdk/build/utils');
const _ = require('lodash');
const { WhiteListedTraits } = require('../../../constants');

const {
  constructPayload,
  getFieldValueFromMessage,
  defaultPostRequestConfig,
  extractCustomFields,
  removeUndefinedAndNullValues,
  defaultBatchRequestConfig,
  getSuccessRespEvents,
} = require('../../util');

const { BASE_ENDPOINT, MAPPING_CONFIG, CONFIG_CATEGORIES, MAX_BATCH_SIZE } = require('./config');
const { JSON_MIME_TYPE } = require('../../util/constant');

/**
 * This function is used for creating response for subscribing users to a particular list.
 * DOCS: https://www.klaviyo.com/docs/api/v2/lists
 */
const subscribeUserToList = (message, traitsInfo, destination) => {
  // listId from message properties are preferred over Config listId
  const { privateApiKey, consent } = destination.Config;
  let { listId } = destination.Config;
  const targetUrl = `${BASE_ENDPOINT}/api/profile-subscription-bulk-create-jobs`;
  const subscriptionObj = {
    email: getFieldValueFromMessage(message, 'email'),
    phone_number: getFieldValueFromMessage(message, 'phone'),
  };

  if (traitsInfo?.properties?.consent || consent) {
    const subscribeConsent = traitsInfo?.properties?.consent || consent;
    const channels = {};

    let subscribeConsentArr = subscribeConsent;
    if (!Array.isArray(subscribeConsentArr)) {
      subscribeConsentArr = [subscribeConsent];
    }

    if (subscribeConsentArr.includes('email')) {
      channels.email = [...(channels.email || []), 'MARKETING'];
    }
    if (subscribeConsentArr.includes('sms')) {
      channels.sms = [...(channels.sms || []), 'MARKETING'];
    }
    subscriptionObj.channels = channels;
  }
  const subscriptions = [subscriptionObj];
  if (traitsInfo?.properties?.listId) {
    listId = traitsInfo.properties.listId;
  }
  if (message.type === 'group') {
    listId = message.groupId;
  }
  const attributes = {
    list_id: listId,
    subscriptions,
  };
  const data = {
    type: 'profile-subscription-bulk-create-job',
    attributes,
  };
  const payload = { data };
  const response = defaultRequestConfig();
  response.method = defaultPostRequestConfig.requestMethod;
  response.endpoint = targetUrl;
  response.headers = {
    Authorization: `Klaviyo-API-Key ${privateApiKey}`,
    'Content-Type': JSON_MIME_TYPE,
    Accept: JSON_MIME_TYPE,
    revision: '2023-02-22',
  };
  response.body.JSON = removeUndefinedAndNullValues(payload);

  return response;
};

/**
 * This function is used to check if the user needs to be subscribed or not.
 * Building and returning response array for subscribe endpoint (for subscribing)
 * @param {*} message
 * @param {*} traitsInfo
 * @param {*} destination
 * @returns
 */
const checkForSubscribe = (message, traitsInfo, destination) => {
  const responseArray = [];
  if (
    (traitsInfo.properties?.listId || destination.Config?.listId) &&
    traitsInfo.properties?.subscribe === true
  ) {
    const subscribeResponse = subscribeUserToList(message, traitsInfo, destination);
    responseArray.push(subscribeResponse);
  }
  return responseArray;
};

// This function is used for creating and returning customer properties using mapping json
const createCustomerProperties = (message) => {
  let customerProperties = constructPayload(
    message,
    MAPPING_CONFIG[CONFIG_CATEGORIES.PROFILE.name],
  );
  customerProperties = removeUndefinedAndNullValues(customerProperties);
  return customerProperties;
};

const populateCustomFieldsFromTraits = (message) => {
  // Extract other K-V property from traits about user custom properties
  let customProperties = {};
  customProperties = extractCustomFields(
    message,
    customProperties,
    ['traits', 'context.traits'],
    WhiteListedTraits,
  );
  return customProperties;
};

const generateBatchedPaylaodForArray = (events) => {
  let batchEventResponse = defaultBatchRequestConfig();
  const batchResponseList = [];
  const metadata = [];
  // extracting destination from the first event in a batch
  const { destination } = events[0];
  // Batch event into dest batch structure
  events.forEach((ev, index) => {
    if (index === 0) {
      batchResponseList.push(ev.message.body.JSON);
    } else {
      batchResponseList[0].data.attributes.subscriptions.push(
        ...ev.message.body.JSON.data.attributes.subscriptions,
      );
    }
    metadata.push(ev.metadata);
  });

  batchEventResponse.batchedRequest = Object.values(batchEventResponse);
  batchEventResponse.batchedRequest[0].body.JSON = {
    data: batchResponseList[0].data,
  };

  const BATCH_ENDPOINT = `${BASE_ENDPOINT}/api/profile-subscription-bulk-create-jobs`;

  batchEventResponse.batchedRequest[0].endpoint = BATCH_ENDPOINT;

  batchEventResponse.batchedRequest[0].headers = {
    Authorization: `Klaviyo-API-Key ${destination.Config.privateApiKey}`,
    'Content-Type': JSON_MIME_TYPE,
    Accept: JSON_MIME_TYPE,
    revision: '2023-02-22',
  };

  batchEventResponse = {
    ...batchEventResponse,
    metadata,
    destination,
  };
  return batchEventResponse;
};

/**
 * It takes list of subscribe responses and groups them on the basis of listId
 * @param {*} subscribeResponseList
 * @returns
 */
const groupSubsribeResponsesUsingListId = (subscribeResponseList) => {
  const subscribeEventGroups = _.groupBy(
    subscribeResponseList,
    (event) => event.message.body.JSON.data.attributes.list_id,
  );
  return subscribeEventGroups;
};

const getBatchedResponseList = (subscribeEventGroups, identifyResponseList) => {
  let batchedResponseList;
  Object.keys(subscribeEventGroups).forEach((listId) => {
    // eventChunks = [[e1,e2,e3,..batchSize],[e1,e2,e3,..batchSize]..]
    const eventChunks = _.chunk(subscribeEventGroups[listId], MAX_BATCH_SIZE);
    batchedResponseList = eventChunks.map((chunk) => {
      const batchEventResponse = generateBatchedPaylaodForArray(chunk);
      return getSuccessRespEvents(
        batchEventResponse.batchedRequest,
        batchEventResponse.metadata,
        batchEventResponse.destination,
        true,
      );
    });
  });
  identifyResponseList.forEach((response) => {
    batchedResponseList[0].batchedRequest.push(response);
  });
  return batchedResponseList;
};

const batchEvents = (successRespList) => {
  const identifyResponseList = [];
  successRespList.forEach((event) => {
    const processedEvent = event;
    if (processedEvent.message.length === 2) {
      // the array will contain one update profile reponse and one subscribe reponse
      identifyResponseList.push(event.message[0]);
      [processedEvent.message] = event.message.slice(1);
    } else {
      // for group events (it will contain only subscribe response)
      [processedEvent.message] = event.message.slice(0);
    }
  });

  const subscribeEventGroups = groupSubsribeResponsesUsingListId(successRespList);

  const batchedResponseList = getBatchedResponseList(subscribeEventGroups, identifyResponseList);

  return batchedResponseList;
};

module.exports = {
  subscribeUserToList,
  checkForSubscribe,
  createCustomerProperties,
  populateCustomFieldsFromTraits,
  generateBatchedPaylaodForArray,
  batchEvents,
};
