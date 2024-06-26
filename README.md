## Getting Started
- Ensure you have Node v18 or above installed (check by running `node --version`).
- Clone the GitHub repo.
- In the root directory of the repo run `npm install` to download and install the dependencies.
- To start the Node.js app, run `npm start` from the root directory of the repo in a terminal window.

## Making Requests
The application offers a single Rest endpoint through which you can provide an IP address and attempt to get back the country associated with said IP address.

Provided no changes have been made to the code in this repo, a single POST endpoint will be available at `http://localhost:3000/country` which will expect a request body of the following structure:
```json
{
  "ip": "<ip_address>"
}
```

The following is an example cURL request:
```
curl --location 'http://127.0.0.1:3000/country' \
--header 'Content-Type: application/json' \
--data '{
"ip": "131.180.0.1"
}'
```

You can use any tool that is capable of making an HTTP POST request with the above makeup.

## Receiving Responses
If there are no issues with the downstream vendors, you will receive a response that contains a response body of the following structure:
```json
{
  "ip": "<ip_address_from_the_request>",
  "country": "<country_name_and_3_digit_code>"
}
```

An example response body is shown below:
```json
{
    "ip": "131.181.0.1",
    "country": "Australia (AUS)"
}
```

### Error Responses
It is possible to receive an error response due to different situations:

#### Bad Request
If you submit a request that fails the request validation checks (missing / invalid request body), you will get a response like the following:

HTTP Status Code: 400 (Bad Request)
```json
{
    "errors": [
        {
            "type": "field",
            "value": "foo",
            "msg": "Invalid value",
            "path": "ip",
            "location": "body"
        }
    ]
}
```

#### Rate Limit Exceeded
If the rate limits for all the vendors has been exceeded and the IP address in the request is not in the cache then you will receive the following error response:

HTTP Status Code: 429 (Too Many Requests)
```json
{
    "errors": "Rate limit exceeded, please wait before making another request"
}
```

#### Issue with Vendors
If there is network issues with the vendors or some other problem that prevents all of them from successfully responding to a request sent to them, then you will receive the following error:

HTTP Status Code: 500 (Internal Server Error)
```json
{
    "errors": "General error calling <vendor_name>: <error_message/details>"
}
```

#### Issue with the application
If there is an issue with the application itself, or somehow no vendor completes the request and none of them generate an error, then you will get the following error response:

HTTP Status Code: 500 (Internal Server Error)
```json
{
    "errors": "No vendor was able to successfully complete the request"
}
```

## Cache
The application has a basic in memory cache that stores each new IP address the application receives along with the country return by a vendor.

If an IP is requested, and it is present in the cache then the cache is used to return the result and no vendors are queried.

The cache can be configured to have an unlimited size or a fixed size.

### Unlimited Cache
The cache capacity can be set to be unlimited (in practice eventually memory size will become an issue) by adjusting the 'cache' entry in `config/default.js`. Adjust the cache settings to the following:
```
    cache: {
        capacity: -1,
    },
```

### Fixed Size Cache
A specific capacity can be set by providing an integer value like in the following example:
```
    cache: {
        capacity: 20,
    },
```

In the above example, when the cache is full and the application wants to insert a new record it will randomly select a record to evict, freeing up space for the new entry.

## Vendors
This application uses one or more vendors to provide IP address to country translation.

### Adding a New Vendor
A new vendor to provide IP address to country translation can be added by following this guideline:
- Add a subdirectory to the `vendors` module.
- Within your subdirectory create a Javascript file named `convert.js` and within that add and export / expose a function called `convert` that takes a string holding the IP address to be translated and will return a string holding the country name that is associated with that IP address. See below for example code skeleton.
```js
exports.convert = async function (ip) {
    // Implementation logic
    return '<country_name>';
}
```
- In `vendor_list.js` add an import to your vendor, similar to the following:
```js
const <unique_name_for_your_vendor> = require('../vendors/<your_subdirectory_name>/convert')
```
- Then within the same file, add your vendor to the existing `vendorList` array in the form `<unique_name_for_your_vendor>.convert`. The list reads from top to bottom, so the earlier / higher in the list a vendor is the higher its priority is. The application will always call the first vendor in the list and will fall through to the next one(s) if there is a problem.
  - For rate limiting your vendor, there are a couple of approaches:
    - Keep it all internal within your vendor submodule. With this approach you are fully responsible for handling everything related to rate limiting.
    - Use the `vendor_helper.js` function `canMakeCall(callHistory, rateLimit)`. Here you would pass an array holding Date (date and time) objects / references of previous calls and an integer representing how many calls to the vendor are allowed per hour. The `canMakeCall` function will return a boolean indicating if the call can be made to the vendor. If the number of previous calls has reached the rate limit, the function will check to see if the oldest call is an hour or more old, and if so remove it from the history, allowing this call to proceed.
      - Under this approach you are responsible for providing a suitable array to hold the Dates of the previous calls, and having a rate limit value.
    - Optional: You can use the `config/default.js` file to hold the rate limit for your vendor so that updating it is easy in the future. Add an object for the following form to the `vendor` object key (see existing entries in said file as a guide):
      ```js
      vendor: {
          ...,
          <unique_name_for_your_vendor>: {
              rate: 5,
          },
          ...,
      },
      ```
      Then within your vendor module you can use the following to get the rate limit so that you can use it within vendor module or pass it to the `vendor_helper`:
      ```js
      const config = require("config");
      const vendorConfig = config.get('vendor.<unique_name_for_your_vendor>');
      let rateLimit = vendorConfig.rate;
      ```

### Rate Limiting
Each vendor can be rate limited (number of requests per hour).

If you use the `canMakeCall` function within `vendor/vendor_helper.js` then a value of -1 will be seen as being an unlimited rate, and no rate limiting will be applied. Any other value will restrict the number of calls to the given vendor to no more than that number in the last hour (60 minutes).

The rate limit for a vendor can be set / configured within `config/default.js`. Each vendor can be configured individually by having an entry under the `vendor` key. See the following as an example:
```js
vendor: {
    ...,
    <unique_name_for_your_vendor>: {
        rate: <rate_limit_as_an_integer>,
    },
    ...,
},
```
So for example, if your vendor's unique name is `foovendor` and you wanted the rate limit to be 10 calls within the last hour (60 minutes) you would add the following:
```js
vendor: {
    ...,
    foovender: {
        rate: 10,
    },
    ...,
},
```