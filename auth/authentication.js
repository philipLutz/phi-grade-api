"use strict";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const queries = require('../db/queries.js');

const Auth = {
	hashPassword(password) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
	},
	comparePassword(hashPassword, password) {
		return bcrypt.compareSync(password, hashPassword);
	},
	isValidEmail(email) {
		return /\S+@\S+\.\S+/.test(email);
	},
	generateToken(user_id, expiry) {
		const token = jwt.sign({
			user_id: user_id
		},
			process.env.SECRET, {expiresIn: expiry}
		);
		return token;
	},
	generateClientToken(user_id, expiry) {
		const token = jwt.sign({
			user_id: user_id
		},
			process.env.CLIENT, {expiresIn: expiry}
		);
		return token;
	},
	verifyToken(req, res, next) {
		if (!req.headers['set-cookie']) {
			return res.status(400).send({ 'message': 'Token is not provided' });
		}
		const token = req.headers['set-cookie'][0].split(';')[0];
		const decodedToken = jwt.verify(token, process.env.SECRET);
		queries.getSingleUser(decodedToken.user_id)
		.then(function(user) {
			req.user = {
				user_id: decodedToken.user_id,
				admin: user.admin
			};
			next();
		})
		.catch(function(error) {
			next(error);
		})
	}
}

module.exports = Auth;
