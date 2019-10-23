const express = require('express');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const queries = require('../db/queries.js');
const Auth = require('../auth/authentication.js');

const User = {
	register(req, res, next) {
		if (!req.body.email || !req.body.password || !req.body.first_name || !req.body.last_name || !req.body.private) {
			return res.status(400).send({'message': 'Some values are missing'});
		}

		if (!Auth.isValidEmail(req.body.email)) {
			return res.status(400).send({ 'message': 'Please enter a valid email address' });
		}

		const hashPassword = Auth.hashPassword(req.body.password);

		const user = [{
			user_id: uuidv4(),
			email: req.body.email,
			password: hashPassword,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			bio: req.body.bio,
			private: req.body.private,
			created_date: moment(new Date()),
			modified_date: moment(new Date())
		}];

		queries.addUser(user)
		.then(function() {
			res.status(200).send({'message': 'User successfully registered'});
		})
		.catch(function(error) {
			next(error);
		})
	},
	login(req, res, next) {

	}
}

module.exports = User;