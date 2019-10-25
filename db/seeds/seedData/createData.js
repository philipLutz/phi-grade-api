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

let users = [];
for (let i=0; i<6; i++) {
	let user = {
		user_id: uuidv4(),
		email: makeString(10) + '@gmail.com',
		password: makeString(7),
		first_name: makeString(32),
		last_name: makeString(32),
		bio: makeString(256),
		private: false,
		created_date: moment(new Date()),
		modified_date: moment(new Date())
	}
	users.push(user);
}

let grades = [];
for (let i=0; i<6; i++) {
	const exampleString = makeString(60);
	const randomIndex = Math.floor(Math.random() * 6);
	const randomUserId = users[randomIndex].user_id;
	let grade = {
		grade_id: uuidv4(),
		user_id: randomUserId,
		decrypted_string: exampleString,
		encrypted_string: bcrypt.hashSync(exampleString, bcrypt.genSaltSync(8)),
		created_date: moment(new Date()),
		modified_date: moment(new Date())
	};
	grades.push(grade);
}

module.exports = {users, grades};