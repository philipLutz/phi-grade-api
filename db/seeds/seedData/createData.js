const bcrypt = require('bcrypt');
const moment = require('moment');
const uuidv4 = require('uuid/v4');

function makeString(length) {
   let result = "";
   const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   const charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

let grades = [];
for (let i=0; i<6; i++) {
	const exampleString = makeString(20);
	let grade = {
		grade_id: uuidv4(),
		user_id: uuidv4(),
		decrypted_string: exampleString,
		encrypted_string: bcrypt.hashSync(exampleString, bcrypt.genSaltSync(8)),
		created_date: moment(new Date()),
		modified_date: moment(new Date())
	};
	grades.push(grade);
}

let users = [];
for (let i=0; i<6; i++) {
	let user = {
		user_id: uuidv4(),
		email: makeString(128),
		password: makeString(128),
		first_name: makeString(32),
		last_name: makeString(32),
		bio: makeString(256),
		private: false,
		created_date: moment(new Date()),
		modified_date: moment(new Date())
	}
	users.push(user);
}

module.exports = {grades, users};