const config = require('config');

const IPCountryModel = require('../model/ip_to_country_model');
const {getVendor, getVendorCount} = require("../vendors/vendor_list");
const ServiceError = require("../error/service_error");

const cacheConfig = config.get('cache');

const cache = new Map();

exports.convertIPToCountry = async function (ip) {
    // See if the IP address is in the cache
    if (cache.has(ip)) {
        return new IPCountryModel(ip, cache.get(ip));
    }

    // IP not in cache, so ask a vendor to convert and add result to cache

    // Determine how many vendors are available
    let numberOfAvailableVendors = getVendorCount();

    // Holder in case errors are thrown by a vendor
    let errorFromVendor;

    // Loop through vendors from the highest priority to lowest until one successfully returns
    for (let priority = 0; priority < numberOfAvailableVendors; priority++) {
        try {
            let vendor = getVendor(priority);
            let country = await vendor(ip);
            insertIntoCache(ip, country)
            return new IPCountryModel(ip, country);
        } catch (error) {
            // The vendor has thrown an error so store it in case we need it later
            errorFromVendor = error;
        }
    }

    // No vendor successfully returned
    if (errorFromVendor !== undefined) {
        // Throw back the last error received from a vendor
        throw errorFromVendor;
    } else {
        // No vendor was successful and none threw an error, so throw a service error
        throw new ServiceError("No vendor was able to successfully complete the request");
    }
}

insertIntoCache = function (ip, country) {
    // Check if the cache is at capacity or see if it is set to unlimited size
    if (cacheConfig.capacity === -1 || cache.size < cacheConfig.capacity) {
        // Cache is not at capacity (or is unlimited capacity), so add
        cache.set(ip, country);
    } else {
        // Cache is at capacity, so randomly remove a record to make room
        const ran = Math.floor(Math.random() * cacheConfig.capacity);
        const iterator = cache.keys();
        let ipToRemove;

        for (let j = 0; j <= ran; j++) {
            ipToRemove = iterator.next().value;
        }
        cache.delete(ipToRemove);
        cache.set(ip, country);
    }
}