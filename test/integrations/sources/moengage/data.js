const data = [
    {
      "name": "moengage",
      "description": "Simple track call",
      "module": "source",
      "version": "v0",
      "input": {
        "request": {
          "body": [
            {
              "anonymousId": "4eb021e9-a2af-4926-ae82-fe996d12f3c5",
              "channel": "web",
              "context": {
                "timezone": "Wrong/Timezone",
                "app": {
                  "build": "1.0.0",
                  "name": "RudderLabs JavaScript SDK",
                  "namespace": "com.rudderlabs.javascript",
                  "version": "1.1.6"
                },
                "library": {
                  "name": "RudderLabs JavaScript SDK",
                  "version": "1.1.6"
                },
                "locale": "en-GB",
                "os": {
                  "name": "",
                  "version": ""
                },
                "page": {
                  "path": "/testing/script-test.html",
                  "referrer": "",
                  "search": "",
                  "title": "",
                  "url": "http://localhost:3243/testing/script-test.html"
                },
                "screen": {
                  "density": 2
                },
                "traits": {
                  "company": {
                    "id": "abc123"
                  },
                  "createdAt": "Thu Mar 24 2016 17:46:45 GMT+0000 (UTC)",
                  "email": "ruchira@gmail.com",
                  "name": "Ruchira Moitra",
                  "plan": "Enterprise"
                },
                "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36"
              },
              "event": "Order Completed",
              "integrations": {
                "All": true
              },
              "messageId": "a0adfab9-baf7-4e09-a2ce-bbe2844c324a",
              "originalTimestamp": "2020-10-16T08:10:12.782Z",
              "properties": {
                "checkout_id": "what is checkout id here??",
                "coupon": "APPARELSALE",
                "currency": "GBP",
                "order_id": "transactionId",
                "products": [
                  {
                    "brand": "",
                    "category": "Merch",
                    "currency": "GBP",
                    "image_url": "https://www.example.com/product/bacon-jam.jpg",
                    "name": "Food/Drink",
                    "position": 1,
                    "price": 3,
                    "product_id": "product-bacon-jam",
                    "quantity": 2,
                    "sku": "sku-1",
                    "typeOfProduct": "Food",
                    "url": "https://www.example.com/product/bacon-jam",
                    "value": 6,
                    "variant": "Extra topped"
                  },
                  {
                    "brand": "Levis",
                    "category": "Merch",
                    "currency": "GBP",
                    "image_url": "https://www.example.com/product/t-shirt.jpg",
                    "name": "T-Shirt",
                    "position": 2,
                    "price": 12.99,
                    "product_id": "product-t-shirt",
                    "quantity": 1,
                    "sku": "sku-2",
                    "typeOfProduct": "Shirt",
                    "url": "https://www.example.com/product/t-shirt",
                    "value": 12.99,
                    "variant": "White"
                  },
                  {
                    "brand": "Levis",
                    "category": "Merch",
                    "coupon": "APPARELSALE",
                    "currency": "GBP",
                    "image_url": "https://www.example.com/product/offer-t-shirt.jpg",
                    "name": "T-Shirt-on-offer",
                    "position": 1,
                    "price": 12.99,
                    "product_id": "offer-t-shirt",
                    "quantity": 1,
                    "sku": "sku-3",
                    "typeOfProduct": "Shirt",
                    "url": "https://www.example.com/product/offer-t-shirt",
                    "value": 12.99,
                    "variant": "Black"
                  }
                ],
                "revenue": 31.98,
                "shipping": 4,
                "value": 31.98
              },
              "receivedAt": "2020-10-16T13:40:12.792+05:30",
              "request_ip": "[::1]",
              "sentAt": "2020-10-16T08:10:12.783Z",
              "timestamp": "2020-10-16T13:40:12.791+05:30",
              "type": "track",
              "userId": "ruchu123"
            }
          ],
          "method": "POST",
          "headers": {
            "Content-Type": "application/json"
          }
        },
        "pathSuffix": ""
      },
      "output": {
        "response": {
          "status": 200,
          "body": [
            {
              "output": {
                "batch": [
                  {
                    "anonymousId": "4eb021e9-a2af-4926-ae82-fe996d12f3c5",
                    "channel": "web",
                    "context": {
                      "timezone": "Wrong/Timezone",
                      "app": {
                        "build": "1.0.0",
                        "name": "RudderLabs JavaScript SDK",
                        "namespace": "com.rudderlabs.javascript",
                        "version": "1.1.6"
                      },
                      "library": {
                        "name": "RudderLabs JavaScript SDK",
                        "version": "1.1.6"
                      },
                      "locale": "en-GB",
                      "os": {
                        "name": "",
                        "version": ""
                      },
                      "page": {
                        "path": "/testing/script-test.html",
                        "referrer": "",
                        "search": "",
                        "title": "",
                        "url": "http://localhost:3243/testing/script-test.html"
                      },
                      "screen": {
                        "density": 2
                      },
                      "traits": {
                        "company": {
                          "id": "abc123"
                        },
                        "createdAt": "Thu Mar 24 2016 17:46:45 GMT+0000 (UTC)",
                        "email": "ruchira@gmail.com",
                        "name": "Ruchira Moitra",
                        "plan": "Enterprise"
                      },
                      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36"
                    },
                    "event": "Order Completed",
                    "integrations": {
                      "All": true
                    },
                    "messageId": "a0adfab9-baf7-4e09-a2ce-bbe2844c324a",
                    "originalTimestamp": "2020-10-16T08:10:12.782Z",
                    "properties": {
                      "checkout_id": "what is checkout id here??",
                      "coupon": "APPARELSALE",
                      "currency": "GBP",
                      "order_id": "transactionId",
                      "products": [
                        {
                          "brand": "",
                          "category": "Merch",
                          "currency": "GBP",
                          "image_url": "https://www.example.com/product/bacon-jam.jpg",
                          "name": "Food/Drink",
                          "position": 1,
                          "price": 3,
                          "product_id": "product-bacon-jam",
                          "quantity": 2,
                          "sku": "sku-1",
                          "typeOfProduct": "Food",
                          "url": "https://www.example.com/product/bacon-jam",
                          "value": 6,
                          "variant": "Extra topped"
                        },
                        {
                          "brand": "Levis",
                          "category": "Merch",
                          "currency": "GBP",
                          "image_url": "https://www.example.com/product/t-shirt.jpg",
                          "name": "T-Shirt",
                          "position": 2,
                          "price": 12.99,
                          "product_id": "product-t-shirt",
                          "quantity": 1,
                          "sku": "sku-2",
                          "typeOfProduct": "Shirt",
                          "url": "https://www.example.com/product/t-shirt",
                          "value": 12.99,
                          "variant": "White"
                        },
                        {
                          "brand": "Levis",
                          "category": "Merch",
                          "coupon": "APPARELSALE",
                          "currency": "GBP",
                          "image_url": "https://www.example.com/product/offer-t-shirt.jpg",
                          "name": "T-Shirt-on-offer",
                          "position": 1,
                          "price": 12.99,
                          "product_id": "offer-t-shirt",
                          "quantity": 1,
                          "sku": "sku-3",
                          "typeOfProduct": "Shirt",
                          "url": "https://www.example.com/product/offer-t-shirt",
                          "value": 12.99,
                          "variant": "Black"
                        }
                      ],
                      "revenue": 31.98,
                      "shipping": 4,
                      "value": 31.98
                    },
                    "receivedAt": "2020-10-16T13:40:12.792+05:30",
                    "request_ip": "[::1]",
                    "sentAt": "2020-10-16T08:10:12.783Z",
                    "timestamp": "2020-10-16T13:40:12.791+05:30",
                    "type": "track",
                    "userId": "ruchu123"
                  }
                ]
              }
            }
          ]
        }
      }
    },
    {
      "name": "moengage",
      "description": "Batch of events",
      "module": "source",
      "version": "v0",
      "input": {
        "request": {
          "body": [
            {
              "batch": [
                {
                  "type": "page",
                  "event": "home",
                  "sentAt": "2020-11-12T21:12:54.117Z",
                  "userId": "sajal",
                  "channel": "mobile",
                  "context": {
                    "traits": {
  
                    },
                    "library": {
                      "name": "rudder-sdk-ruby-sync",
                      "version": "1.0.7"
                    },
                    "page": {
                      "path": "/Rectified.html",
                      "referrer": "http://localhost:1112/",
                      "search": "",
                      "title": "",
                      "url": "http://localhost:1112/Rectified.html"
                    },
                    "userAgent": "Dalvik/2.1.0 (Linux; U; Android 10; Redmi K20 Pro MIUI/V12.0.3.0.QFKINXM)"
                  },
                  "rudderId": "asdfasdfsadf",
                  "properties": {
                    "name": "asdfsadf"
                  },
                  "timestamp": "2020-11-12T21:12:41.320Z",
                  "anonymousId": "123123123123"
                },
                {
                  "anonymousId": "4eb021e9-a2af-4926-ae82-fe996d12f3c5",
                  "channel": "web",
                  "context": {
                    "timezone": "Asia/Tokyo",
                    "app": {
                      "build": "1.0.0",
                      "name": "RudderLabs JavaScript SDK",
                      "namespace": "com.rudderlabs.javascript",
                      "version": "1.1.6"
                    },
                    "library": {
                      "name": "RudderLabs JavaScript SDK",
                      "version": "1.1.6"
                    },
                    "locale": "en-GB",
                    "os": {
                      "name": "",
                      "version": ""
                    },
                    "page": {
                      "path": "/testing/script-test.html",
                      "referrer": "",
                      "search": "",
                      "title": "",
                      "url": "http://localhost:3243/testing/script-test.html"
                    },
                    "screen": {
                      "density": 2
                    },
                    "traits": {
                      "company": {
                        "id": "abc123"
                      },
                      "createdAt": "Thu Mar 24 2016 17:46:45 GMT+0000 (UTC)",
                      "email": "ruchira@gmail.com",
                      "name": "Ruchira Moitra",
                      "plan": "Enterprise"
                    },
                    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36"
                  },
                  "event": "Order Completed",
                  "integrations": {
                    "All": true
                  },
                  "messageId": "a0adfab9-baf7-4e09-a2ce-bbe2844c324a",
                  "originalTimestamp": "2020-10-16T08:10:12.782Z",
                  "properties": {
                    "checkout_id": "what is checkout id here??",
                    "coupon": "APPARELSALE",
                    "currency": "GBP",
                    "order_id": "transactionId",
                    "category": "some category",
                    "originalArray": [
                      {
                        "nested_field": "nested value",
                        "tags": [
                          "tag_1",
                          "tag_2",
                          "tag_3"
                        ]
                      },
                      {
                        "nested_field": "nested value",
                        "tags": [
                          "tag_1",
                          "tag_2",
                          "tag_3"
                        ]
                      },
                      {
                        "nested_field": "nested value",
                        "tags": [
                          "tag_1",
                          "tag_2",
                          "tag_3"
                        ]
                      },
                      {
                        "nested_field": "nested value",
                        "tags": [
                          "tag_1",
                          "tag_2",
                          "tag_3"
                        ]
                      },
                      {
                        "nested_field": "nested value",
                        "tags": [
                          "tag_1",
                          "tag_2",
                          "tag_3"
                        ]
                      },
                      {
                        "nested_field": "nested value",
                        "tags": [
                          "tag_1",
                          "tag_2",
                          "tag_3"
                        ]
                      },
                      {
                        "nested_field": "nested value",
                        "tags": [
                          "tag_1",
                          "tag_2",
                          "tag_3"
                        ]
                      },
                      {
                        "nested_field": "nested value",
                        "tags": [
                          "tag_1",
                          "tag_2",
                          "tag_3"
                        ]
                      },
                      {
                        "nested_field": "nested value",
                        "tags": [
                          "tag_1",
                          "tag_2",
                          "tag_3"
                        ]
                      }
                    ],
                    "products": [
                      {
                        "brand": "",
                        "category": "Merch",
                        "currency": "GBP",
                        "image_url": "https://www.example.com/product/bacon-jam.jpg",
                        "name": "Food/Drink",
                        "position": 1,
                        "price": 3,
                        "product_id": "product-bacon-jam",
                        "quantity": 2,
                        "sku": "sku-1",
                        "typeOfProduct": "Food",
                        "url": "https://www.example.com/product/bacon-jam",
                        "value": 6,
                        "variant": "Extra topped"
                      },
                      {
                        "brand": "Levis",
                        "category": "Merch",
                        "currency": "GBP",
                        "image_url": "https://www.example.com/product/t-shirt.jpg",
                        "name": "T-Shirt",
                        "position": 2,
                        "price": 12.99,
                        "product_id": "product-t-shirt",
                        "quantity": 1,
                        "sku": "sku-2",
                        "typeOfProduct": "Shirt",
                        "url": "https://www.example.com/product/t-shirt",
                        "value": 12.99,
                        "variant": "White"
                      },
                      {
                        "brand": "Levis",
                        "category": "Merch",
                        "coupon": "APPARELSALE",
                        "currency": "GBP",
                        "image_url": "https://www.example.com/product/offer-t-shirt.jpg",
                        "name": "T-Shirt-on-offer",
                        "position": 1,
                        "price": 12.99,
                        "product_id": "offer-t-shirt",
                        "quantity": 1,
                        "sku": "sku-3",
                        "typeOfProduct": "Shirt",
                        "url": "https://www.example.com/product/offer-t-shirt",
                        "value": 12.99,
                        "variant": "Black"
                      }
                    ],
                    "revenue": 31.98,
                    "shipping": 4,
                    "value": 31.98
                  },
                  "receivedAt": "2020-10-16T13:40:12.792+05:30",
                  "request_ip": "[::1]",
                  "sentAt": "2020-10-16T08:10:12.783Z",
                  "timestamp": "2020-10-16T13:40:12.791+05:30",
                  "type": "track",
                  "userId": "ruchu123"
                }
              ]
            }
          ],
          "method": "POST",
          "headers": {
            "Content-Type": "application/json"
          }
        },
        "pathSuffix": ""
      },
      "output": {
        "response": {
          "status": 200,
          "body": [
            {
              "output": {
                "batch": [
                  {
                    "type": "page",
                    "event": "home",
                    "sentAt": "2020-11-12T21:12:54.117Z",
                    "userId": "sajal",
                    "channel": "mobile",
                    "context": {
                      "traits": {
  
                      },
                      "library": {
                        "name": "rudder-sdk-ruby-sync",
                        "version": "1.0.7"
                      },
                      "page": {
                        "path": "/Rectified.html",
                        "referrer": "http://localhost:1112/",
                        "search": "",
                        "title": "",
                        "url": "http://localhost:1112/Rectified.html"
                      },
                      "userAgent": "Dalvik/2.1.0 (Linux; U; Android 10; Redmi K20 Pro MIUI/V12.0.3.0.QFKINXM)"
                    },
                    "rudderId": "asdfasdfsadf",
                    "properties": {
                      "name": "asdfsadf"
                    },
                    "timestamp": "2020-11-12T21:12:41.320Z",
                    "anonymousId": "123123123123"
                  },
                  {
                    "anonymousId": "4eb021e9-a2af-4926-ae82-fe996d12f3c5",
                    "channel": "web",
                    "context": {
                      "timezone": "Asia/Tokyo",
                      "app": {
                        "build": "1.0.0",
                        "name": "RudderLabs JavaScript SDK",
                        "namespace": "com.rudderlabs.javascript",
                        "version": "1.1.6"
                      },
                      "library": {
                        "name": "RudderLabs JavaScript SDK",
                        "version": "1.1.6"
                      },
                      "locale": "en-GB",
                      "os": {
                        "name": "",
                        "version": ""
                      },
                      "page": {
                        "path": "/testing/script-test.html",
                        "referrer": "",
                        "search": "",
                        "title": "",
                        "url": "http://localhost:3243/testing/script-test.html"
                      },
                      "screen": {
                        "density": 2
                      },
                      "traits": {
                        "company": {
                          "id": "abc123"
                        },
                        "createdAt": "Thu Mar 24 2016 17:46:45 GMT+0000 (UTC)",
                        "email": "ruchira@gmail.com",
                        "name": "Ruchira Moitra",
                        "plan": "Enterprise"
                      },
                      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36"
                    },
                    "event": "Order Completed",
                    "integrations": {
                      "All": true
                    },
                    "messageId": "a0adfab9-baf7-4e09-a2ce-bbe2844c324a",
                    "originalTimestamp": "2020-10-16T08:10:12.782Z",
                    "properties": {
                      "checkout_id": "what is checkout id here??",
                      "coupon": "APPARELSALE",
                      "currency": "GBP",
                      "order_id": "transactionId",
                      "category": "some category",
                      "originalArray": [
                        {
                          "nested_field": "nested value",
                          "tags": [
                            "tag_1",
                            "tag_2",
                            "tag_3"
                          ]
                        },
                        {
                          "nested_field": "nested value",
                          "tags": [
                            "tag_1",
                            "tag_2",
                            "tag_3"
                          ]
                        },
                        {
                          "nested_field": "nested value",
                          "tags": [
                            "tag_1",
                            "tag_2",
                            "tag_3"
                          ]
                        },
                        {
                          "nested_field": "nested value",
                          "tags": [
                            "tag_1",
                            "tag_2",
                            "tag_3"
                          ]
                        },
                        {
                          "nested_field": "nested value",
                          "tags": [
                            "tag_1",
                            "tag_2",
                            "tag_3"
                          ]
                        },
                        {
                          "nested_field": "nested value",
                          "tags": [
                            "tag_1",
                            "tag_2",
                            "tag_3"
                          ]
                        },
                        {
                          "nested_field": "nested value",
                          "tags": [
                            "tag_1",
                            "tag_2",
                            "tag_3"
                          ]
                        },
                        {
                          "nested_field": "nested value",
                          "tags": [
                            "tag_1",
                            "tag_2",
                            "tag_3"
                          ]
                        },
                        {
                          "nested_field": "nested value",
                          "tags": [
                            "tag_1",
                            "tag_2",
                            "tag_3"
                          ]
                        }
                      ],
                      "products": [
                        {
                          "brand": "",
                          "category": "Merch",
                          "currency": "GBP",
                          "image_url": "https://www.example.com/product/bacon-jam.jpg",
                          "name": "Food/Drink",
                          "position": 1,
                          "price": 3,
                          "product_id": "product-bacon-jam",
                          "quantity": 2,
                          "sku": "sku-1",
                          "typeOfProduct": "Food",
                          "url": "https://www.example.com/product/bacon-jam",
                          "value": 6,
                          "variant": "Extra topped"
                        },
                        {
                          "brand": "Levis",
                          "category": "Merch",
                          "currency": "GBP",
                          "image_url": "https://www.example.com/product/t-shirt.jpg",
                          "name": "T-Shirt",
                          "position": 2,
                          "price": 12.99,
                          "product_id": "product-t-shirt",
                          "quantity": 1,
                          "sku": "sku-2",
                          "typeOfProduct": "Shirt",
                          "url": "https://www.example.com/product/t-shirt",
                          "value": 12.99,
                          "variant": "White"
                        },
                        {
                          "brand": "Levis",
                          "category": "Merch",
                          "coupon": "APPARELSALE",
                          "currency": "GBP",
                          "image_url": "https://www.example.com/product/offer-t-shirt.jpg",
                          "name": "T-Shirt-on-offer",
                          "position": 1,
                          "price": 12.99,
                          "product_id": "offer-t-shirt",
                          "quantity": 1,
                          "sku": "sku-3",
                          "typeOfProduct": "Shirt",
                          "url": "https://www.example.com/product/offer-t-shirt",
                          "value": 12.99,
                          "variant": "Black"
                        }
                      ],
                      "revenue": 31.98,
                      "shipping": 4,
                      "value": 31.98
                    },
                    "receivedAt": "2020-10-16T13:40:12.792+05:30",
                    "request_ip": "[::1]",
                    "sentAt": "2020-10-16T08:10:12.783Z",
                    "timestamp": "2020-10-16T13:40:12.791+05:30",
                    "type": "track",
                    "userId": "ruchu123"
                  }
                ]
              }
            }
          ]
        }
      }
    }
  ]
  
module.exports = {
    data
}