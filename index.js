// require
require("dotenv").config();
const express = require("express");
const port = 3000;

const bodyParser = require("body-parser");
const app = express();

// redis setting
const redis = require('redis');
const REDIS_PORT = 6379;
const client = redis.createClient(REDIS_PORT)

// let body converted to JSON
app.use(express.static("public"));
app.use("/admin", express.static("public"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/test', (req, res) => {
  if(redis.on("ready"), (err, result) => {
    console.log('OK');
    res.send('OK')

  }) else {
    console.log('NO');
    res.send('NO')
  }

})

// Error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`);
});

module.exports = app;