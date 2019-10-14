exports.up = function(knex, Promise) {
	let createQuery = `CREATE TABLE users(
  		user_id UUID PRIMARY KEY,
  		email VARCHAR(128) UNIQUE NOT NULL,
  		password VARCHAR(128) NOT NULL,
       	first_name VARCHAR(32) NOT NULL,
       	last_name VARCHAR(32) NOT NULL,
  		bio VARCHAR(256),
  		private BOOLEAN NOT NULL,
  		created_date TIMESTAMP,
  		modified_date TIMESTAMP
  	)`;
  	return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
	let dropQuery = `DROP TABLE users`;
 	return knex.raw(dropQuery);
};
