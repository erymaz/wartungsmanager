// To test internal token process you should execute npm run internal-token:test and follow http://localhost:5050/test.
// Prerequisites:

// 1. cd internal-token-test && npm i
// 2. cd ..
// 3. npm run internal-token:test

const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();

const JWT_CONFIG = {
    jwtInternalPublic: fs.readFileSync(
      path.join(process.cwd(), '/data/certs/development/internal.key.pub'),
    ),
    jwtInternalSecret: fs.readFileSync(
      path.join(process.cwd(), '/data/certs/development/internal.key'),
    ),
    jwtInternalAlgorithm: 'RS256',
};

app.get('/generate', (req, res) => {
    const token = jwt.sign({ isAllAllowed: true }, JWT_CONFIG.jwtInternalSecret, {
        algorithm: JWT_CONFIG.jwtInternalAlgorithm,
    });

    res.json({ success: true, data: token });
});

app.get('/test', (req, res) => {

    const token = jwt.sign({ isAllAllowed: true }, JWT_CONFIG.jwtInternalSecret, {
        algorithm: JWT_CONFIG.jwtInternalAlgorithm,
    });

    axios.default.get('http://localhost:8080/users', { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
            res.json({ success: true, data: response.data });
        })
        .catch((error) => {
            res.json({ success: false, data: error.response.data });
        });
});

app.listen(5050, () => {
    console.log('Internal Token Test Server has been started on http://localhost:5050/test');
});
