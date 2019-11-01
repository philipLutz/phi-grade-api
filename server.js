"use strict";
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const gradesRouter = require('./routes/gradesRouter.js');
const usersRouter = require('./routes/usersRouter.js');

const app = express();

// Logging
app.use(morgan('common'));

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

// Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve Static Files
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/html/signup.html');
});

// Allow app to parse JSON
app.use(express.json());

// Dummy Endpoint
app.get('/api', (req, res) => {
	return res.status(200).send({'message': 'Phi Grade API'});
});

// Router
app.use('/api/users', usersRouter);
app.use('/api/grades', gradesRouter);

// Error Handling
app.use(function(req, res, next) {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

if (app.get('env') === 'development') {
  app.use(function(error, req, res, next) {
    res.status(error.status || 500);
    res.json({
      message: error.message,
      error: error
    });
  });
}

app.use(function(error, req, res, next) {
  res.status(error.status || 500);
  res.json({
    message: error.message,
    error: {}
  });
});

// App Running
app.listen(process.env.PORT);
console.log('Unnecessarily cryptic climbing grades being created on port:', process.env.PORT);

module.exports = app;