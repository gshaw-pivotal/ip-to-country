const IPCountryModel = require('../model/IPCountryModel');
const ipgeolocation = require('../vendors/ipgeolocation/convert')

const cache = new Map();

exports.convertIPToCountry = async function (ip) {
    // See if the IP address is in the cache
    if (cache.has(ip)) {
        return new IPCountryModel(ip, cache.get(ip));
    }

    // IP not in cache, so ask vendor to convert and add result to cache
    let country = await ipgeolocation.convert(ip);
    cache.set(ip, country);
    return new IPCountryModel(ip, country);
}