const knex = require('./knex.js');

// Users
function Users() {
	return knex('users');
}

function getAllUsers() {
	return Users().select();
}

function getSingleUser(userId) {
  return Users().where('user_id', userId).first();
}

function addUser(user) {
	return Users().insert(user);
}

function updateUser(userId, updates) {
	return Users().where('user_id', userId).update(updates);
}

function deleteUser(userId) {
	return Users().where('user_id', userId).del();
}

// Grades
function Grades() {
	return knex('grades');
}

function getAllGrades() {
	return Grades().select();
}

function getAllUserGrades(userId) {
	return Grades().where('user_id', userId);
}

function getSingleGrade(gradeId) {
	return Grades().where('grade_id', gradeId).first();
}

function addGrade(grade) {
	return Grades().insert(grade, 'grade_id');
}

function updateGrade(gradeId, updates) {
	return Grades().where('grade_id', gradeId).update(updates);
}

function deleteGrade(gradeId) {
	return Grades().where('grade_id', gradeId).del();
}


module.exports = {
	getAllUsers: getAllUsers,
	getSingleUser: getSingleUser,
	addUser: addUser,
	updateUser: updateUser,
	deleteUser: deleteUser,
	getAllGrades: getAllGrades,
	getAllUserGrades: getAllUserGrades,
	getSingleGrade: getSingleGrade,
	addGrade: addGrade,
	updateGrade: updateGrade,
	deleteGrade: deleteGrade
};