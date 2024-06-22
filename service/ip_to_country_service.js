const IPCountryModel = require('../model/IPCountryModel');

const cache = new Map();

exports.convertIPToCountry = function(ip) {
    // See if the IP address is in the cache
    if (cache.has(ip)) {
        return new IPCountryModel(ip, cache.get(ip));
    }

    // IP not in cache, so ask vendor to convert
    cache.set(ip, "Australia");
    return new IPCountryModel(ip, cache.get(ip));
}