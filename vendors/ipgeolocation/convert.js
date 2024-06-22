const axios = require('axios');
const config = require("config");

const baseURL = 'https://api.ipgeolocation.io';

const callHistory = [];

const httpRequest = axios.create({baseURL: baseURL});

const hourInMilli = 3600000;

const vendorConfig = config.get('vendor.ipgeolocation');

exports.convert = async function (ip) {
    if (canMakeCall()) {
        callHistory.push(Date.now());
        const responseData = await httpRequest.get('/ipgeo', {
            headers: {
                'Host': 'api.ipgeolocation.io',
                'Origin': 'https://api.ipgeolocation.io',
                'Referer': 'https://api.ipgeolocation.io/',
            },
            params: {
                include: 'hostname',
                ip: `${ip}`
            }
        })
            .then((response) => response.data)
            .catch((error) => {
                console.log(error);
            });

        return `${responseData.country_name} (${responseData.country_code3})`;
    } else {
        console.log('Rate limit reached');
    }
}

canMakeCall = function() {
    // Rate limit has not yet been reached
    if (callHistory.length < vendorConfig.rate) {
        return true;
    }

    // Rate limit reached, check to see if earliest call is an hour or more ago
    if (callHistory[0] <= Date.now() - hourInMilli) {
        // Earliest call was an hour or more, remove from history
        callHistory.shift();
        return true;
    }

    return false;
}