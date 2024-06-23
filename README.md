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

A specific capacity can be set by providing an integer value like in the following example:
```
    cache: {
        capacity: 20,
    },
```

In the above example, when the cache is full and the application wants to insert a new record it will randomly select a record to evict, freeing up space for the new entry.
