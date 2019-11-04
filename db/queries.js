const knex = require('./knex.js');

// Users
function Users() {
	return knex('users');
}

function getAllUsers() {
	return Users().select();
}

function getSingleUser(user_id) {
  return Users().where('user_id', user_id).first();
}

function getUserEmail(email) {
	return Users().where('email', email).first();
}

function addUser(user) {
	return Users().insert(user);
}

function updateUser(user_id, updates) {
	return Users().where('user_id', user_id).update(updates);
}

function deleteUser(user_id) {
	return Users().where('user_id', user_id).del();
}

// Grades
function Grades() {
	return knex('grades');
}

function getAllGrades() {
	return Grades().select();
}

function getAllUserGrades(user_id) {
	return Grades().where('user_id', user_id);
}

function getSingleGrade(encrypted_string) {
	return Grades().where('encrypted_string', encrypted_string).first();
}

function addGrade(grade) {
	return Grades().insert(grade);
}

function updateGrade(grade_id, updates) {
	return Grades().where('grade_id', grade_id).update(updates);
}

function deleteGrade(grade_id) {
	return Grades().where('grade_id', grade_id).del();
}


module.exports = {
	getAllUsers: getAllUsers,
	getSingleUser: getSingleUser,
	getUserEmail: getUserEmail,
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