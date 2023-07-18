const {
  combineBatchRequestsWithSameJobIds,
  combineBatchRequestsWithSameJobIds2,
} = require('./util');

const destinationMock = {
  Config: {
    token: 'test_api_token',
    prefixProperties: true,
    useNativeSDK: false,
    useOldMapping: true,
  },
  DestinationDefinition: {
    DisplayName: 'Mixpanel',
    ID: 'test_destination_definition_id',
    Name: 'MP',
  },
  Enabled: true,
  ID: 'test_id',
  Name: 'Mixpanel',
  Transformations: [],
};

describe('Mixpanel utils test', () => {
  describe('Unit test cases for combineBatchRequestsWithSameJobIds', () => {
    it('Combine batch request with same jobIds', async () => {
      const input = [
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/track/',
          },
          metadata: [
            {
              jobId: 1,
            },
            {
              jobId: 4,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/import/',
          },
          metadata: [
            {
              jobId: 3,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/track/',
          },
          metadata: [
            {
              jobId: 5,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/engage/',
          },
          metadata: [
            {
              jobId: 1,
            },
            {
              jobId: 3,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/import/',
          },
          metadata: [
            {
              jobId: 6,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
      ];

      const expectedOutput = [
        {
          batchedRequest: [
            {
              endpoint: 'https://api.mixpanel.com/import/',
            },
            {
              endpoint: 'https://api.mixpanel.com/track/',
            },
            {
              endpoint: 'https://api.mixpanel.com/engage/',
            },
          ],
          metadata: [
            {
              jobId: 3,
            },
            {
              jobId: 1,
            },
            {
              jobId: 4,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/track/',
          },
          metadata: [
            {
              jobId: 5,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/import/',
          },
          metadata: [
            {
              jobId: 6,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
      ];
      expect(combineBatchRequestsWithSameJobIds(input)).toEqual(expectedOutput);
    });

    it('Each batchRequest contains unique jobIds (no event multiplexing)', async () => {
      const input = [
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/track/',
          },
          metadata: [
            {
              jobId: 1,
            },
            {
              jobId: 4,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/engage/',
          },
          metadata: [
            {
              jobId: 2,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/engage/',
          },
          metadata: [
            {
              jobId: 5,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
      ];

      const expectedOutput = [
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/track/',
          },

          metadata: [
            {
              jobId: 1,
            },
            {
              jobId: 4,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/engage/',
          },
          metadata: [
            {
              jobId: 2,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/engage/',
          },
          metadata: [
            {
              jobId: 5,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
      ];
      expect(combineBatchRequestsWithSameJobIds(input)).toEqual(expectedOutput);
    });
  });
  describe('Unit test cases for combineBatchRequestsWithSameJobIds2', () => {
    it('Combine batch request with same jobIds', async () => {
      const input = [
        {
          batchedRequest: {
            version: '1',
            type: 'REST',
            method: 'POST',
            endpoint: 'https://api.mixpanel.com/engage/',
            headers: {},
            params: {},
            body: {
              JSON: {},
              JSON_ARRAY: {
                batch:
                  '[{"$append":{"$transactions":{"$time":"2023-07-06T06:29:02.402Z","$amount":18.9}},"$token":"test_api_token","$distinct_id":"userId01"},{"$set":{"$email":"mickey@disney.com","$country_code":"USA","$city":"Disney","$initial_referrer":"https://docs.rudderstack.com","$initial_referring_domain":"docs.rudderstack.com","$firstName":"Mickey","$browser":"Chrome","$browser_version":"79.0.3945.117"},"$token":"test_api_token","$distinct_id":"e6ab2c5e-2cda-44a9-a962-e2f67df78bca","$ip":"0.0.0.0","$time":1688624942},{"$set":{"$created":"2020-01-23T08:54:02.362Z","$email":"mickey@disney.com","$country_code":"USA","$city":"Disney","$initial_referrer":"https://docs.rudderstack.com","$initial_referring_domain":"docs.rudderstack.com","$name":"Mickey Mouse","$firstName":"Mickey","$lastName":"Mouse","$browser":"Chrome","$browser_version":"79.0.3945.117"},"$token":"test_api_token","$distinct_id":"$device:anonId01","$ip":"0.0.0.0","$time":1688624942}]',
              },
              XML: {},
              FORM: {},
            },
            files: {},
          },
          metadata: [
            {
              jobId: 2,
              additionalProp: 2,
            },
            {
              jobId: 3,
              additionalProp: 3,
            },
            {
              jobId: 4,
              additionalProp: 4,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: {
            Config: {
              apiSecret: 'test_api_secret',
              token: 'test_api_token',
              prefixProperties: true,
              identityMergeApi: 'simplified',
              strictMode: true,
            },
            DestinationDefinition: {
              DisplayName: 'Mixpanel',
              ID: '1WhbSZ6uA3H5ChVifHpfL2H6sie',
              Name: 'MP',
            },
            Enabled: true,
            ID: '1WhcOCGgj9asZu850HvugU2C3Aq',
            Name: 'Mixpanel',
            Transformations: [],
          },
        },
        {
          batchedRequest: {
            version: '1',
            type: 'REST',
            method: 'POST',
            endpoint: 'https://api.mixpanel.com/engage/',
            headers: {},
            params: {},
            body: {
              JSON: {},
              JSON_ARRAY: {
                batch:
                  '[{"$set":{"$carrier":"Android","$manufacturer":"Google","$model":"Android SDK built for x86","$screen_height":1794,"$screen_width":1080,"$wifi":true,"anonymousId":"5094f5704b9cf2b3","userId":"test_user_id","$ios_devices":["test_device_token"],"$os":"iOS","$ios_device_model":"Android SDK built for x86","$ios_version":"8.1.0","$ios_app_release":"1","$ios_app_version":"1.0"},"$token":"test_api_token","$distinct_id":"test_user_id","$time":null},{"$token":"test_api_token","$distinct_id":"userId06","$set":{"company":["testComp"]},"$ip":"0.0.0.0"}]',
              },
              XML: {},
              FORM: {},
            },
            files: {},
          },
          metadata: [
            {
              jobId: 5,
              additionalProp: 5,
            },
            {
              jobId: 6,
              additionalProp: 6,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: {
            Config: {
              apiSecret: 'test_api_secret',
              token: 'test_api_token',
              prefixProperties: true,
              useNativeSDK: false,
              strictMode: true,
            },
            DestinationDefinition: {
              DisplayName: 'Mixpanel',
              ID: '1WhbSZ6uA3H5ChVifHpfL2H6sie',
              Name: 'MP',
            },
            Enabled: true,
            ID: '1WhcOCGgj9asZu850HvugU2C3Aq',
            Name: 'Mixpanel',
            Transformations: [],
          },
        },
        {
          batchedRequest: {
            version: '1',
            type: 'REST',
            method: 'POST',
            endpoint: 'https://api.mixpanel.com/groups/',
            headers: {},
            params: {},
            body: {
              JSON: {},
              JSON_ARRAY: {
                batch:
                  '[{"$token":"test_api_token","$group_key":"company","$group_id":"testComp","$set":{"company":"testComp"}}]',
              },
              XML: {},
              FORM: {},
            },
            files: {},
          },
          metadata: [
            {
              jobId: 6,
              additionalProp: 6,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: {
            Config: {
              apiSecret: 'test_api_secret',
              token: 'test_api_token',
              groupKeySettings: [
                {
                  groupKey: 'company',
                },
              ],
              strictMode: true,
            },
            DestinationDefinition: {
              DisplayName: 'Mixpanel',
              ID: '1WhbSZ6uA3H5ChVifHpfL2H6sie',
              Name: 'MP',
            },
            Enabled: true,
            ID: '1WhcOCGgj9asZu850HvugU2C3Aq',
            Name: 'Mixpanel',
            Transformations: [],
          },
        },
        {
          batchedRequest: {
            version: '1',
            type: 'REST',
            method: 'POST',
            endpoint: 'https://api.mixpanel.com/import/',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Basic dGVzdF9hcGlfc2VjcmV0Og==',
            },
            params: {
              strict: 1,
            },
            body: {
              JSON: {},
              JSON_ARRAY: {
                batch:
                  '[{"event":"Loaded a Page","properties":{"ip":"0.0.0.0","$user_id":"hjikl","$current_url":"https://docs.rudderstack.com/destinations/mixpanel","$screen_dpi":2,"mp_lib":"RudderLabs JavaScript SDK","$app_build_number":"1.0.0","$app_version_string":"1.0.5","$insert_id":"dd266c67-9199-4a52-ba32-f46ddde67312","token":"test_api_token","distinct_id":"hjikl","time":1688624942,"name":"Contact Us","$browser":"Chrome","$browser_version":"79.0.3945.117"}},{"event":"Product Viewed","properties":{"name":"T-Shirt","revenue":18.9,"$user_id":"userId01","$os":"iOS","$screen_height":1794,"$screen_width":1080,"$screen_dpi":420,"$carrier":"Android","$os_version":"8.1.0","$device":"generic_x86","$manufacturer":"Google","$model":"Android SDK built for x86","mp_device_model":"Android SDK built for x86","$wifi":true,"$bluetooth_enabled":false,"mp_lib":"com.rudderstack.android.sdk.core","$app_build_number":"1","$app_version_string":"1.0","$insert_id":"id2","token":"test_api_token","distinct_id":"userId01","time":1688624942,"$device_id":"anonId01"}}]',
              },
              XML: {},
              FORM: {},
            },
            files: {},
          },
          metadata: [
            {
              jobId: 1,
              additionalProp: 1,
            },
            {
              jobId: 2,
              additionalProp: 2,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: {
            Config: {
              apiSecret: 'test_api_secret',
              token: 'test_api_token',
              prefixProperties: true,
              useNativeSDK: false,
              useOldMapping: true,
              strictMode: true,
            },
            DestinationDefinition: {
              DisplayName: 'Mixpanel',
              ID: '1WhbSZ6uA3H5ChVifHpfL2H6sie',
              Name: 'MP',
            },
            Enabled: true,
            ID: '1WhcOCGgj9asZu850HvugU2C3Aq',
            Name: 'Mixpanel',
            Transformations: [],
          },
        },
        {
          batchedRequest: {
            version: '1',
            type: 'REST',
            method: 'POST',
            endpoint: 'https://api.mixpanel.com/import/',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Basic dGVzdF9hcGlfc2VjcmV0Og==',
            },
            params: {
              strict: 1,
            },
            body: {
              JSON: {},
              JSON_ARRAY: {
                batch:
                  '[{"event":"$merge","properties":{"$distinct_ids":["test_user_id","5094f5704b9cf2b3"],"token":"test_api_token"}}]',
              },
              XML: {},
              FORM: {},
            },
            files: {},
          },
          metadata: [
            {
              jobId: 5,
              additionalProp: 5,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: {
            Config: {
              apiSecret: 'test_api_secret',
              token: 'test_api_token',
              prefixProperties: true,
              useNativeSDK: false,
              strictMode: true,
            },
            DestinationDefinition: {
              DisplayName: 'Mixpanel',
              ID: '1WhbSZ6uA3H5ChVifHpfL2H6sie',
              Name: 'MP',
            },
            Enabled: true,
            ID: '1WhcOCGgj9asZu850HvugU2C3Aq',
            Name: 'Mixpanel',
            Transformations: [],
          },
        },
      ];

      const expectedOutput = [
        {
          batchedRequest: [
            {
              version: '1',
              type: 'REST',
              method: 'POST',
              endpoint: 'https://api.mixpanel.com/engage/',
              headers: {},
              params: {},
              body: {
                JSON: {},
                JSON_ARRAY: {
                  batch:
                    '[{"$append":{"$transactions":{"$time":"2023-07-06T06:29:02.402Z","$amount":18.9}},"$token":"test_api_token","$distinct_id":"userId01"},{"$set":{"$email":"mickey@disney.com","$country_code":"USA","$city":"Disney","$initial_referrer":"https://docs.rudderstack.com","$initial_referring_domain":"docs.rudderstack.com","$firstName":"Mickey","$browser":"Chrome","$browser_version":"79.0.3945.117"},"$token":"test_api_token","$distinct_id":"e6ab2c5e-2cda-44a9-a962-e2f67df78bca","$ip":"0.0.0.0","$time":1688624942},{"$set":{"$created":"2020-01-23T08:54:02.362Z","$email":"mickey@disney.com","$country_code":"USA","$city":"Disney","$initial_referrer":"https://docs.rudderstack.com","$initial_referring_domain":"docs.rudderstack.com","$name":"Mickey Mouse","$firstName":"Mickey","$lastName":"Mouse","$browser":"Chrome","$browser_version":"79.0.3945.117"},"$token":"test_api_token","$distinct_id":"$device:anonId01","$ip":"0.0.0.0","$time":1688624942}]',
                },
                XML: {},
                FORM: {},
              },
              files: {},
            },
            {
              version: '1',
              type: 'REST',
              method: 'POST',
              endpoint: 'https://api.mixpanel.com/import/',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic dGVzdF9hcGlfc2VjcmV0Og==',
              },
              params: {
                strict: 1,
              },
              body: {
                JSON: {},
                JSON_ARRAY: {
                  batch:
                    '[{"event":"Loaded a Page","properties":{"ip":"0.0.0.0","$user_id":"hjikl","$current_url":"https://docs.rudderstack.com/destinations/mixpanel","$screen_dpi":2,"mp_lib":"RudderLabs JavaScript SDK","$app_build_number":"1.0.0","$app_version_string":"1.0.5","$insert_id":"dd266c67-9199-4a52-ba32-f46ddde67312","token":"test_api_token","distinct_id":"hjikl","time":1688624942,"name":"Contact Us","$browser":"Chrome","$browser_version":"79.0.3945.117"}},{"event":"Product Viewed","properties":{"name":"T-Shirt","revenue":18.9,"$user_id":"userId01","$os":"iOS","$screen_height":1794,"$screen_width":1080,"$screen_dpi":420,"$carrier":"Android","$os_version":"8.1.0","$device":"generic_x86","$manufacturer":"Google","$model":"Android SDK built for x86","mp_device_model":"Android SDK built for x86","$wifi":true,"$bluetooth_enabled":false,"mp_lib":"com.rudderstack.android.sdk.core","$app_build_number":"1","$app_version_string":"1.0","$insert_id":"id2","token":"test_api_token","distinct_id":"userId01","time":1688624942,"$device_id":"anonId01"}}]',
                },
                XML: {},
                FORM: {},
              },
              files: {},
            },
          ],
          metadata: [
            {
              jobId: 2,
              additionalProp: 2,
            },
            {
              jobId: 3,
              additionalProp: 3,
            },
            {
              jobId: 4,
              additionalProp: 4,
            },
            {
              jobId: 1,
              additionalProp: 1,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: {
            Config: {
              apiSecret: 'test_api_secret',
              token: 'test_api_token',
              prefixProperties: true,
              identityMergeApi: 'simplified',
              strictMode: true,
            },
            DestinationDefinition: {
              DisplayName: 'Mixpanel',
              ID: '1WhbSZ6uA3H5ChVifHpfL2H6sie',
              Name: 'MP',
            },
            Enabled: true,
            ID: '1WhcOCGgj9asZu850HvugU2C3Aq',
            Name: 'Mixpanel',
            Transformations: [],
          },
        },
        {
          batchedRequest: [
            {
              version: '1',
              type: 'REST',
              method: 'POST',
              endpoint: 'https://api.mixpanel.com/engage/',
              headers: {},
              params: {},
              body: {
                JSON: {},
                JSON_ARRAY: {
                  batch:
                    '[{"$set":{"$carrier":"Android","$manufacturer":"Google","$model":"Android SDK built for x86","$screen_height":1794,"$screen_width":1080,"$wifi":true,"anonymousId":"5094f5704b9cf2b3","userId":"test_user_id","$ios_devices":["test_device_token"],"$os":"iOS","$ios_device_model":"Android SDK built for x86","$ios_version":"8.1.0","$ios_app_release":"1","$ios_app_version":"1.0"},"$token":"test_api_token","$distinct_id":"test_user_id","$time":null},{"$token":"test_api_token","$distinct_id":"userId06","$set":{"company":["testComp"]},"$ip":"0.0.0.0"}]',
                },
                XML: {},
                FORM: {},
              },
              files: {},
            },
            {
              version: '1',
              type: 'REST',
              method: 'POST',
              endpoint: 'https://api.mixpanel.com/groups/',
              headers: {},
              params: {},
              body: {
                JSON: {},
                JSON_ARRAY: {
                  batch:
                    '[{"$token":"test_api_token","$group_key":"company","$group_id":"testComp","$set":{"company":"testComp"}}]',
                },
                XML: {},
                FORM: {},
              },
              files: {},
            },
            {
              version: '1',
              type: 'REST',
              method: 'POST',
              endpoint: 'https://api.mixpanel.com/import/',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic dGVzdF9hcGlfc2VjcmV0Og==',
              },
              params: {
                strict: 1,
              },
              body: {
                JSON: {},
                JSON_ARRAY: {
                  batch:
                    '[{"event":"$merge","properties":{"$distinct_ids":["test_user_id","5094f5704b9cf2b3"],"token":"test_api_token"}}]',
                },
                XML: {},
                FORM: {},
              },
              files: {},
            },
          ],
          metadata: [
            {
              jobId: 5,
              additionalProp: 5,
            },
            {
              jobId: 6,
              additionalProp: 6,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: {
            Config: {
              apiSecret: 'test_api_secret',
              token: 'test_api_token',
              prefixProperties: true,
              useNativeSDK: false,
              strictMode: true,
            },
            DestinationDefinition: {
              DisplayName: 'Mixpanel',
              ID: '1WhbSZ6uA3H5ChVifHpfL2H6sie',
              Name: 'MP',
            },
            Enabled: true,
            ID: '1WhcOCGgj9asZu850HvugU2C3Aq',
            Name: 'Mixpanel',
            Transformations: [],
          },
        },
      ];
      expect(combineBatchRequestsWithSameJobIds2(input)).toEqual(expectedOutput);
    });

    it('Each batchRequest contains unique jobIds (no event multiplexing)', async () => {
      const input = [
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/track/',
          },
          metadata: [
            {
              jobId: 1,
            },
            {
              jobId: 4,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/engage/',
          },
          metadata: [
            {
              jobId: 2,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: {
            endpoint: 'https://api.mixpanel.com/engage/',
          },
          metadata: [
            {
              jobId: 5,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
      ];

      const expectedOutput = [
        {
          batchedRequest: [
            {
              endpoint: 'https://api.mixpanel.com/track/',
            },
          ],

          metadata: [
            {
              jobId: 1,
            },
            {
              jobId: 4,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: [
            {
              endpoint: 'https://api.mixpanel.com/engage/',
            },
          ],
          metadata: [
            {
              jobId: 2,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
        {
          batchedRequest: [
            {
              endpoint: 'https://api.mixpanel.com/engage/',
            },
          ],
          metadata: [
            {
              jobId: 5,
            },
          ],
          batched: true,
          statusCode: 200,
          destination: destinationMock,
        },
      ];
      expect(combineBatchRequestsWithSameJobIds2(input)).toEqual(expectedOutput);
    });
  });
});
