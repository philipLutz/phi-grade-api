const express = require('express');
const router = express.Router();
const Grade = require('../controller/Grade.js');
const Auth = require('../auth/authentication.js');

router.get('/all', Auth.verifyToken, Grade.getAllGrades);
router.get('/:encrypted_string', Auth.verifyToken, Grade.getSingleGrade);
router.post('/', Auth.verifyToken, Grade.add);
router.update('/:grade_id', Auth.verifyToken, Grade.update);
router.delete('/:grade_id', Auth.verifyToken, Grade.delete);

module.exports = router;