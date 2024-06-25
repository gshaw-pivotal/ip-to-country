const assert = require("node:assert");
const { describe, it } = require("node:test");
const {mock} = require("cjs-mock");
const request = require("supertest");
const {app} = require("./api");

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
});