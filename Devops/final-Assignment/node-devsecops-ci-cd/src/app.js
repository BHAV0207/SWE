const express = require('express')
const app = express();


app.get('/health', (req, res) => {
    res.status(200).json({ status: "UP" });
});

app.get('/', (req, res) => {
    res.status(200).send('Hello World');
});

module.exports = app;