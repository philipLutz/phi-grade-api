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

module.exports = grades;