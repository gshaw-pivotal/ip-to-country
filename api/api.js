const express = require('express');
const app = express();
const {validationResult, body, matchedData} = require('express-validator');
const bodyParser = require('body-parser');

const service = require("../service/ip_to_country_service")
const RateLimitExceededError = require("../error/rate_limit_exceeded_error");
const VendorError = require("../error/vendor_error");

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({  extended: true }));

const checkIPToCountryRequest = () => body('ip').trim().isIP();

app.post('/country', checkIPToCountryRequest(), async function (req, res) {
    const errors = validationResult(req);

    // The request has failed validation checks, return bad request and the errors
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    // The request has passed validation checks
    try {
        const result = await service.convertIPToCountry(matchedData(req).ip);
        return res.status(200).json(result).end();
    } catch (error) {
        // The service returned an error processing the ip address to country
        if (error instanceof RateLimitExceededError) {
            // The rate limit for the vendor(s) has been exceeded
            return res.status(429).json({errors: error.message});
        }
        if (error instanceof VendorError) {
            return res.status(500).json({errors: error.message});
        }
    }
})

exports.app = app;