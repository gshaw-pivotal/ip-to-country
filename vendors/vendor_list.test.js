const assert = require("node:assert");
const { describe, it } = require("node:test");

const {getVendorCount, getVendor} = require("./vendor_list");
const ServiceError = require("../error/service_error");

describe('vendor_list', () => {
    describe('getVendor', () => {
        it('returns a vendor function when the request index / priority is less than the list length', () => {
            const numberOfVendors = getVendorCount();
            assert.doesNotThrow(() => getVendor(numberOfVendors - 1));
        });

        it('throws an Error when the request index / priority is greater than the list length', () => {
            const numberOfVendors = getVendorCount();
            assert.throws(() => {getVendor(numberOfVendors)}, {name: ServiceError.name});
        });
    });
});