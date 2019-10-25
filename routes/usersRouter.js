const express = require('express');
const router = express.Router();
const User = require('../controller/User.js');
const Auth = require('../auth/authentication.js');

router.post('/register', User.register);

router.post('/login', User.login);

router.get('/:user_id', Auth.verifyToken, User.getSingleUser);

router.put('/', Auth.verifyToken, User.update);

router.delete('/:user_id', Auth.verifyToken, User.delete);

module.exports = router;