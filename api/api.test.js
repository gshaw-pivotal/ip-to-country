const assert = require("node:assert");
const { describe, it } = require("node:test");
const {mock} = require("cjs-mock");
const request = require("supertest");

const {app} = require("./api");
const IPCountryModel = require("../model/ip_to_country_model");
const RateLimitExceededError = require("../error/rate_limit_exceeded_error");
const ServiceError = require("../error/service_error");
const VendorError = require("../error/vendor_error");

describe('api', () => {
    it('should return bad request when there is no request body', async () => {
        await request(app)
            .post('/country')
            .expect(400);
    });

    it('should return bad request when there is an invalid request body', async () => {
        await request(app)
            .post('/country')
            .send({foo: 'bar'})
            .expect(400);
    });

    it('should return bad request when the value of the ip key is an empty string', async () => {
        await request(app)
            .post('/country')
            .send({ip: ''})
            .expect(400);
    });

    it('should return bad request when the value of the ip key is not an IP address', async () => {
        await request(app)
            .post('/country')
            .send({ip: 'not-an-ip-address'})
            .expect(400);
    });

    it('should return a 429 when ip_to_country_service throws a RateLimitExceededError', async () => {
        const mocked = mock('./api', {
            '../service/ip_to_country_service': {
                convertIPToCountry: (ip) => {
                    throw new RateLimitExceededError('Error')
                },
            },
        });

        await request(mocked.app)
            .post('/country')
            .send({ip: '1.1.1.1'})
            .expect(429);
    });

    it('should return a 500 when ip_to_country_service throws a VendorError', async () => {
        const mocked = mock('./api', {
            '../service/ip_to_country_service': {
                convertIPToCountry: (ip) => {
                    throw new VendorError('Error')
                },
            },
        });

        await request(mocked.app)
            .post('/country')
            .send({ip: '1.1.1.1'})
            .expect(500);
    });

    it('should return a 500 when ip_to_country_service throws a ServiceError', async () => {
        const mocked = mock('./api', {
            '../service/ip_to_country_service': {
                convertIPToCountry: (ip) => {
                    throw new ServiceError('Error')
                },
            },
        });

        await request(mocked.app)
            .post('/country')
            .send({ip: '1.1.1.1'})
            .expect(500);
    });

    it('should return a 200 when ip_to_country_service returns successfully', async () => {
        const result = new IPCountryModel('1.1.1.1', 'Country (Country-Code)')

        const mocked = mock('./api', {
            '../service/ip_to_country_service': {
                convertIPToCountry: (ip) => Promise.resolve(result)
            },
        });

        const response = await request(mocked.app)
            .post('/country')
            .send({ip: '1.1.1.1'});

        assert.equal(response.status, 200);
        assert.equal(response.body.ip, '1.1.1.1');
        assert.equal(response.body.country, 'Country (Country-Code)');
    });
});