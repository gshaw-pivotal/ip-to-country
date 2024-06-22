const express = require('express');
const app = express();
const {validationResult, body, matchedData} = require('express-validator');
const bodyParser = require('body-parser');

const service = require("../service/ip_to_country_service")

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({  extended: true }));

const checkIPToCountryRequest = () => body('ip').trim().isIP();

app.post('/country', checkIPToCountryRequest(), function (req, res) {
    const errors = validationResult(req);

    // The request has failed validation checks, return bad request and the errors
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    // The request has passed validation checks
    const result = service.convertIPToCountry(matchedData(req).ip);
    return res.status(200).json(result).end();
})

exports.app = app;