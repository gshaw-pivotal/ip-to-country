const assert = require("node:assert");
const { describe, it } = require("node:test");

const {canMakeCall} = require( "./vendor_helper");

describe('vendor_helper', () => {
    describe('canMakeCall', () => {
        it('returns true when rateLimit is unlimited and empty callHistory', () => {
            assert.equal(canMakeCall([], -1), true);
        });

        it('returns true when rateLimit is unlimited and populated callHistory', () => {
            const callHistory = [
                Date.now() - 5000,
                Date.now() - 4000,
                Date.now() - 3000,
                Date.now() - 4000,
                Date.now() - 1000,
                Date.now(),
            ];
            assert.equal(canMakeCall(callHistory, -1), true);
        });

        it('returns true when rateLimit is fixed and callHistory is less than rateLimit', () => {
            const callHistory = [
                Date.now() - 5000,
                Date.now() - 4000,
                Date.now() - 3000,
                Date.now() - 4000,
                Date.now() - 1000,
                Date.now(),
            ];
            assert.equal(canMakeCall(callHistory, 10), true);
        });

        it('returns true when rateLimit is fixed and callHistory is at rate limit, but oldest is more than an hour ago', () => {
            const callHistory = [
                Date.now() - 4000000,
                Date.now() - 4000,
                Date.now() - 3000,
                Date.now() - 4000,
                Date.now() - 1000,
            ];
            assert.equal(canMakeCall(callHistory, 5), true);
        });

        it('returns true when rateLimit is fixed and callHistory is at rate limit, but oldest is an hour ago', () => {
            const callHistory = [
                Date.now() - 3600000,
                Date.now() - 4000,
                Date.now() - 3000,
                Date.now() - 4000,
                Date.now() - 1000,
            ];
            assert.equal(canMakeCall(callHistory, 5), true);
        });

        it('returns false when rateLimit is fixed and callHistory is at rate limit, and oldest is less than an hour ago', () => {
            const callHistory = [
                Date.now() - 5000,
                Date.now() - 4000,
                Date.now() - 3000,
                Date.now() - 4000,
                Date.now() - 1000,
            ];
            assert.equal(canMakeCall(callHistory, 5), false);
        });
    });
});