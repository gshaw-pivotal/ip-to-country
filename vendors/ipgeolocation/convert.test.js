const assert = require("node:assert");
const { describe, it } = require("node:test");
const {mock} = require("cjs-mock");
const axios = require("axios");

describe('ipgeolocation - convert', () => {
    it('should throw VendorError if axios call fails', async () => {
        const mocked = mock('./convert', {
            '../vendor_helper': {
                canMakeCall: (callHistory, rateLimit) => {
                    return true;
                },
            },
            'axios': {
                create: () => {
                    return axios.create({baseURL: ''})
                },
                get: () => Promise.reject()
            },
        });

        await assert.rejects(async () => {
            await mocked.convert('1.1.1.1');
        },{
            name: 'VendorError'
        });
    });

    it('should throw RateLimitExceededError if the rate limit has been exceeded', async () => {
        const mocked = mock('./convert', {
            '../vendor_helper': {
                canMakeCall: (callHistory, rateLimit) => {
                    return false;
                },
            },
            'axios': {
                create: () => {
                    return axios.create({baseURL: ''})
                },
            },
        });

        await assert.rejects(async () => {
            await mocked.convert('1.1.1.1');
        },{
            name: 'RateLimitExceededError'
        });
    });
});