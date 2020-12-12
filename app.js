// require
require("dotenv").config();
const express = require("express");
const port = 3000;
const bodyParser = require("body-parser");
const apiVersion = "1.0";
const app = express();

app.set("json spaces", 2);

// let body converted to JSON
app.use(express.static("public"));
app.use("/admin", express.static("public"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// API routes
app.use('/api/' + apiVersion, 
  [
    require('./server/routes/admin_route'),
    require('./server/routes/product_route'),
    require('./server/routes/marketing_route'),
    require('./server/routes/user_route'),
    require('./server/routes/order_route'),
    require('./server/routes/midterm_route')
  ]
);

// Error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
  console.log('here')
  console.log(err)
});

app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`);
});

module.exports = app;