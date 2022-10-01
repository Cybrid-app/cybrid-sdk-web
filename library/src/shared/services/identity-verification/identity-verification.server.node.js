require('dotenv').config();
const express = require('express'); // eslint-disable-line
const bodyParser = require('body-parser');

const CUSTOMER = require('./customer.data');
const IDENTITY_DATA = require('./identity.data');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Returns existing customer data
app.get('/api/customers', async (req, res) => {
  res.json(CUSTOMER.KYC_STATE_REQUIRED());
});

// Creates an identity verification
app.post('/api/identity_verifications', async (req, res) => {
  res.json(IDENTITY_DATA.NEW());
});

// Returns current identity verification
app.get('/api/identity_verifications', async (req, res) => {
  setTimeout(() => {
    res.json(IDENTITY_DATA.STATE_STORING());
  }, 5000);
});

app.listen(process.env.PORT || 8888);
