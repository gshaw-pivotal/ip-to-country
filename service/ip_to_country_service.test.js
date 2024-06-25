const assert = require("node:assert");
const { describe, it } = require("node:test");
const {mock} = require("cjs-mock");

const RateLimitExceededError = require("../error/rate_limit_exceeded_error");
const VendorError = require("../error/vendor_error");

describe('ip_to_country_service', () => {
   it('returns the ip and associated country when vendor successfully returns', async () => {
       const mocked = mock('./ip_to_country_service', {
           '../vendors/vendor_list': {
               getVendorCount: () => 1,
               getVendor: () => function (ip) {
                   return 'Country (3-digit-code)';
               },
           },
       });

       const result = await mocked.convertIPToCountry('1.1.1.1');
       assert.equal(result.ip, '1.1.1.1');
       assert.equal(result.country, 'Country (3-digit-code)');
   });

    it('only calls the vendor for new ip addresses', async () => {
        let vendorCallCount = 0;
        const mocked = mock('./ip_to_country_service', {
            '../vendors/vendor_list': {
                getVendorCount: () => 1,
                getVendor: () => function (ip) {
                    vendorCallCount++;
                    return 'Country (3-digit-code)';
                },
            },
        });

        // First time seeing this IP address, so call to a vendor
        let result = await mocked.convertIPToCountry('1.1.1.1');
        assert.equal(result.ip, '1.1.1.1');
        assert.equal(result.country, 'Country (3-digit-code)');

        // Second time seeing this IP address, so use the cache and no vendor call required
        result = await mocked.convertIPToCountry('1.1.1.1');
        assert.equal(result.ip, '1.1.1.1');
        assert.equal(result.country, 'Country (3-digit-code)');

        // Check the vendor was only called once
        assert.equal(vendorCallCount, 1);
    });

    it('returns the ip and associated country provided one vendor succeeds', async () => {
        let vendorCallCount = 0;
        const mocked = mock('./ip_to_country_service', {
            '../vendors/vendor_list': {
                getVendorCount: () => 2,
                getVendor: () => function (ip) {
                    vendorCallCount++;
                    if (vendorCallCount === 1) {
                        throw new RateLimitExceededError('Error');
                    } else {
                        return 'Country (3-digit-code)';
                    }
                },
            },
        });

        const result = await mocked.convertIPToCountry('1.1.1.1');
        assert.equal(result.ip, '1.1.1.1');
        assert.equal(result.country, 'Country (3-digit-code)');

        // Check that 2 vendors were called (first threw an error, second processed the request successfully)
        assert.equal(vendorCallCount, 2);
    });

    it('throws RateLimitedExceededError when the only vendor throws said error', async () => {
        const mocked = mock('./ip_to_country_service', {
            '../vendors/vendor_list': {
                getVendorCount: () => 1,
                getVendor: () => function (ip) {
                    throw new RateLimitExceededError('Error');
                },
            },
        });

        await assert.rejects(async () => {
                await mocked.convertIPToCountry('1.1.1.1')
            },
            {
                name: 'RateLimitExceededError'
            }
        );
    });

    it('throws VendorError when the only vendor throws said error', async () => {
        const mocked = mock('./ip_to_country_service', {
            '../vendors/vendor_list': {
                getVendorCount: () => 1,
                getVendor: () => function (ip) {
                    throw new VendorError('Error');
                },
            },
        });

        await assert.rejects(async () => {
                await mocked.convertIPToCountry('1.1.1.1')
            },
            {
                name: 'VendorError'
            }
        );
    });

    it('throws ServiceError when there are no vendors', async () => {
        const mocked = mock('./ip_to_country_service', {
            '../vendors/vendor_list': {
                getVendorCount: () => 0,
            },
        });

        await assert.rejects(async () => {
                await mocked.convertIPToCountry('1.1.1.1')
            },
            {
                name: 'ServiceError'
            }
        );
    });
});