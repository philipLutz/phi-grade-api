'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Logging
app.use(morgan('common'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// CORS
// const cors = require('cors');

// app.use(
//     cors({
//         origin: CLIENT_ORIGIN
//     })
// );

app.use(express.json());

// Dummy Endpoint
app.get('/api', (req, res) => {
	return res.status(200).send({'message': 'Phi Grade API'});
});

app.listen(process.env.PORT);
console.log('app running on port ', process.env.PORT);