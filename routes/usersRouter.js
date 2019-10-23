const express = require('express');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const router = express.Router();
const queries = require('../db/queries.js');
const Auth = require('../auth/authentication.js');
const User = require('../controller/User.js');

router.post('/register', User.register);

router.post('/login', User.login);

module.exports = router;