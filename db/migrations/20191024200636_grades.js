exports.up = function(knex) {
  let createQuery = `CREATE TABLE grades(
		grade_id UUID PRIMARY KEY,
		user_id UUID NOT NULL,
		decrypted_string VARCHAR(60) NOT NULL,
		encrypted_string VARCHAR(60) NOT NULL,
		created_date TIMESTAMP,
		modified_date TIMESTAMP
	)`;
	return knex.raw(createQuery);
};

exports.down = function(knex) {
  let dropQuery = `DROP TABLE grades`;
 return knex.raw(dropQuery);
};