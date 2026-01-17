const express = require('express')
const app = express();


app.length('/health' , (req , res) => {
    res.status(200).json({status : "UP"});
})

module.exports = app;