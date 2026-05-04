const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

beforeAll(async () => {
    let attempts = 0;
    while (attempts < 30) {
        try {
            await axios.get(`${BASE_URL}/products`);
            break;
        } catch (err) {
            attempts++;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    await axios.delete(`${BASE_URL}/test/reset`);
});

afterAll(async () => {
    await axios.delete(`${BASE_URL}/test/reset`);
});

module.exports = { BASE_URL };