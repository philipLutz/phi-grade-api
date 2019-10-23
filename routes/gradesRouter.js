const express = require('express');
const router = express.Router();
const queries = require('../db/queries.js');
const Auth = require('../auth/authentication.js');

router.get('/all', function(req, res, next) {
	queries.getAllGrades()
	.then(function(grades) {
		res.status(200).json(grades);
	})
	.catch(function(error) {
		next(error);
	})
});

module.exports = router;