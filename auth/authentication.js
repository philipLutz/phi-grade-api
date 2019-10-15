const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const knex = require('../db/knex.js');

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
	generateToken(userId) {
		const token = jwt.sign({
			userId: userId
		},
			process.env.SECRET, {expiresIn: '1d'}
		);
		return token;
	},
	async verifyToken(req, res, next) {
		const token = req.headers['x-access-token'];
		if (!token) {
			return res.status(400).send({ 'message': 'Token is not provided' });
		}
		try {
			const decoded = await jwt.verify(token, process.env.SECRET);
			const {rows} = await knex('users').where({user_id: decoded.userId}).first();
			if (!rows[0]) {
				return res.status(400).send({ 'message': 'The token you provided is invalid' });
			}
			req.user = {id: decoded.userId};
			next();
		}	catch(error) {
			return res.status(400).send(error);
		}
	}
}

module.exports = Auth;