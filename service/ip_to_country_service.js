const config = require('config');

const IPCountryModel = require('../model/ip_to_country_model');
const ipgeolocation = require('../vendors/ipgeolocation/convert')

const cacheConfig = config.get('cache');

const cache = new Map();

exports.convertIPToCountry = async function (ip) {
    // See if the IP address is in the cache
    if (cache.has(ip)) {
        return new IPCountryModel(ip, cache.get(ip));
    }

    // IP not in cache, so ask vendor to convert and add result to cache
    try {
        let country = await ipgeolocation.convert(ip);
        insertIntoCache(ip, country)
        return new IPCountryModel(ip, country);
    } catch (error) {
        throw error;
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