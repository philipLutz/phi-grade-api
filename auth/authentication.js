const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
// const knex = require('../db/knex.js');
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
	generateToken(user_id) {
		const token = jwt.sign({
			user_id: user_id
		},
			process.env.SECRET, {expiresIn: '1d'}
		);
		return token;
	},
	verifyToken(req, res, next) {
		const token = req.headers['x-access-token'];
		if (!token) {
			return res.status(400).send({ 'message': 'Token is not provided' });
		}
		const decodedToken = jwt.verify(token, process.env.SECRET);
		queries.getSingleUser(decodedToken.user_id)
		.then(function(user) {
			req.user = {user_id: decodedToken.user_id};
			next();
		})
		.catch(function(error) {
			next(error);
		})
	}
}

module.exports = Auth;