const axios = require('axios');

const baseURL = 'https://api.ipgeolocation.io';

const httpRequest = axios.create({baseURL: baseURL});

exports.convert = async function (ip) {
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
}