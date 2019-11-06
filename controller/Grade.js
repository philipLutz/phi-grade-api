"use strict";
const express = require('express');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const queries = require('../db/queries.js');
const Auth = require('../auth/authentication.js');

const Grade = {
	getAllGrades(req, res, next) {
		queries.getAllGrades()
		.then(function(grades) {
			return res.status(200).send(grades);
		})
		.catch(function(error) {
			next(error);
		})
	},
	getAllUserGrades(req, res, next) {
		queries.getAllUserGrades(req.params.user_id)
		.then(function(grades) {
			return res.status(200).send(grades);
		})
		.catch(function(error) {
			next(error);
		})
	},
	getSingleGrade(req, res, next) {
		queries.getSingleGrade(req.body.encrypted_string)
		.then(function(grade) {
			return res.status(200).send(grade);
		})
		.catch(function(error) {
			next(error);
		})
	},
	add(req, res, next) {
		if (!req.body.decrypted_string) {
			return res.status(400).send({'message': 'Some values are missing'});
		}	else {
			const encrypted_string = Auth.hashPassword(req.body.decrypted_string);
			const grade = [{
				grade_id: uuidv4(),
				user_id: req.user.user_id,
				decrypted_string: req.body.decrypted_string,
				encrypted_string: encrypted_string,
				created_date: moment(new Date()),
				modified_date: moment(new Date())
			}];
			queries.addGrade(grade)
			.then(function() {
				return res.status(201).send({'message':'Grade successfully added to database'})
			})
			.catch(function(error) {
				next(error);
			})
		}
	},
	update(req, res, next) {
		if (!req.body.decrypted_string) {
			return res.status(400).send({'message': 'Some values are missing'});
		}	else {
			queries.getSingleGradeId(req.params.grade_id)
			.then(function(grade) {
				if (req.user.user_id === grade.user_id) {
					const encrypted_string = Auth.hashPassword(req.body.decrypted_string);
					const updates = {
						decrypted_string: req.body.decrypted_string,
						encrypted_string: encrypted_string,
						modified_date: moment(new Date())
					};
					queries.updateGrade(grade.grade_id, updates)
					.then(function() {
						return res.status(200).send({'message':'Grade successfully updated'});
					})
					.catch(function(error) {
						next(error);
					})
				}	else {
					return res.status(401).send({'message':'Unauthorized request to update grade'});
				}
				
			})
			.catch(function(error) {
				next(error);
			})
		}
	},
	delete(req, res, next) {
		queries.getSingleGradeId(req.params.grade_id)
		.then(function(grade) {
			if (req.user.user_id === grade.user_id) {
				queries.deleteGrade(req.params.grade_id)
				.then(function() {
					return res.status(200).send({'message':'Grade successfully deleted'});
				})
				.catch(function(error) {
					next(error);
				})
			}	else {
				return res.status(401).send({'message':'Unauthorized request to delete grade'});
			}
		})
		.catch(function(error) {
			next(error);
		})
	}
}

module.exports = Grade;