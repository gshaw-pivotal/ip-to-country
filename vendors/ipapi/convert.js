const axios = require('axios');
const config = require("config");

const {canMakeCall} = require("../vendor_helper");
const RateLimitExceededError = require("../../error/rate_limit_exceeded_error");
const VendorError = require("../../error/vendor_error");

const baseURL = 'https://ipapi.co';

const callHistory = [];

const httpRequest = axios.create({baseURL: baseURL});

const vendorConfig = config.get('vendor.ipapi');

exports.convert = async function (ip) {
    if (canMakeCall(callHistory, vendorConfig.rate)) {
        callHistory.push(Date.now());
        const responseData = await httpRequest.get(`/${ip}/json`, {
            headers: {
                'Host': 'ipapi.co',
                'Referer': 'https://ipapi.co/',
            },
        })
            .then((response) => response.data)
            .catch((error) => {
                console.log(`General error calling ipgeolocation: ${error}`);
                throw new VendorError(error);
            });

        return `${responseData.country_name} (${responseData.country_code_iso3})`;
    } else {
        console.log('Rate limit reached for ipapi');
        throw new RateLimitExceededError('Rate limit exceeded, please wait before making another request');
    }
}
