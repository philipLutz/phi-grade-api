"use strict";
const express = require('express');
const router = express.Router();
const Grade = require('../controller/Grade.js');
const Auth = require('../auth/authentication.js');

router.get('/', Auth.verifyToken, Grade.getAllGrades);
router.get('/one', Auth.verifyToken, Grade.getSingleGrade);
router.get('/all/:user_id', Auth.verifyToken, Grade.getAllUserGrades);
router.post('/', Auth.verifyToken, Grade.add);
router.put('/:grade_id', Auth.verifyToken, Grade.update);
router.delete('/:grade_id', Auth.verifyToken, Grade.delete);

module.exports = router;
