"use strict";
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
			return res.status(400).send({'message': 'Please enter a valid email address'});
		}
		queries.getUserEmail(req.body.email)
		.then(function(user) {
			if (user !== undefined) {
				return res.status(400).send({'message': 'Please enter a different email address'});
			}	else {
				const hashPassword = Auth.hashPassword(req.body.password);
				const user = [{
					user_id: uuidv4(),
					email: req.body.email,
					password: hashPassword,
					first_name: req.body.first_name,
					last_name: req.body.last_name,
					bio: req.body.bio,
					private: req.body.private,
					admin: false,
					created_date: moment(new Date()),
					modified_date: moment(new Date())
				}];
				queries.addUser(user)
				.then(function() {
					res.status(201).send({'message': 'User successfully registered'});
				})
				.catch(function(error) {
					next(error);
				})
			}
		})
		.catch(function(error) {
			next(error);
		})
	},
	login(req, res, next) {
		if (!req.body.email || !req.body.password) {
			return res.status(400).send({'message': 'Some values are missing'});
		}
		if (!Auth.isValidEmail(req.body.email)) {
			return res.status(400).send({'message': 'Please enter a valid email address'});
		}
		queries.getUserEmail(req.body.email)
		.then(function(user) {
			if (!Auth.comparePassword(user.password, req.body.password)) {
				return res.status(400).send({'message': 'The credentials you provided are incorrect'});
			}	else {
				let expiry = new Date();
				expiry.setDate(expiry.getDate() + parseInt(process.env.EXPIRY.charAt(0)));
				const token = Auth.generateToken(user.user_id);
				const clientToken = Auth.generateClientToken(user.user_id);
				const cookieConfig = {
					httpOnly: true,
					// In production, secure should be set to true.  While doing local testing, I am not using https
					secure: false,
					signed: false,
					expires: expiry
				}
				return res.status(200).cookie('token', token, cookieConfig).send([
					{'message': 'Login success'},
					{'client_token': clientToken}
				]);
			}
		})
		.catch(function(error) {
			next(error);
		})
	},
	getSingleUser(req, res, next) {
		queries.getSingleUser(req.params.user_id)
		.then(function(user) {
			if (!user.private) {
				const publicUserInfo = {
					user_id: user.user_id,
					first_name: user.first_name,
					last_name: user.last_name,
					bio: user.bio
				}
				return res.status(200).send(publicUserInfo);
			}	else {
				return res.status(401).send({'message':'The information for this user is private'});
			}
		})
		.catch(function(error) {
			next(error);
		})
	},
	update(req, res, next) {
		queries.getSingleUser(req.user.user_id)
		.then(function(user) {
			const updates = {
				first_name: req.body.first_name || user.first_name,
				last_name: req.body.last_name || user.last_name,
				bio: req.body.bio || user.bio,
				modified_date: moment(new Date())
			};
			queries.updateUser(user.user_id, updates)
			.then(function() {
				return res.status(200).send({'message':'User information successfully updated'});
			})
			.catch(function(error) {
				next(error);
			})
		})
		.catch(function(error) {
			next(error);
		})
	},
	delete(req, res, next) {
		if (req.user.admin === true) {
			queries.deleteUser(req.params.user_id)
			.then(function() {
				return res.status(200).send({'message':'User successfully deleted'});
			})
			.catch(function(error) {
				next(error)
			})
		}	else {
			return res.status(401).send({'message': 'You do not have access to delete users'});
		}

	}
}

module.exports = User;
