require('dotenv').config();
const express = require('express'); // eslint-disable-line
const bodyParser = require('body-parser');

const IDENTITY = require('./identity.data.json');
const CUSTOMER = require('./customer.data.json');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*
 * Takes request header and returns expected data response
 * */
function requestHandler(req, dataSet) {
  return dataSet[req.headers.data];
}

/*
 * Returns existing customer data
 * */
app.get('/api/customers', async (req, res) => {
  res.json(CUSTOMER[req.headers.data]);
});

/*
 * Creates an identity verification
 * Timeout to mock server response
 * */
app.post('/api/identity_verifications', async (req, res) => {
  setTimeout(() => {
    res.json(IDENTITY[req.headers.data]);
  }, 500);
});

/*
 * Returns current identity verification
 * */
app.get('/api/identity_verifications', async (req, res) => {
  res.json(IDENTITY[req.headers.data]);
});

app.listen(process.env.PORT || 8888);
