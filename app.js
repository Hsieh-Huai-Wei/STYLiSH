// require
require('dotenv').config();
const { NODE_ENV, PORT, PORT_TEST, API_VERSION} = process.env;
const port = NODE_ENV == 'test' ? PORT_TEST : PORT;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('json spaces', 2);

// let body converted to JSON
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// API routes
app.use('/api/' + API_VERSION, 
  [
    require('./server/routes/admin_route'),
    require('./server/routes/product_route'),
    require('./server/routes/marketing_route'),
    require('./server/routes/user_route'),
    require('./server/routes/order_route'),
  ]
);

// Error handling
app.use((err, req, res, next) => {
  console.log(err)
  let msg = '伺服器似乎有狀況，請稍後再試!'
  if (err) msg = err;
  res.status(err.status || 500);
  res.json({ error: msg });
});

app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`);
});

module.exports = app;