var express = require('express');
var app = express();
var {validationResult, body} = require('express-validator');
var bodyParser = require('body-parser')
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
    return res.status(200).send('OK').end();
})

exports.app = app;