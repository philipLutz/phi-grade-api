const data = require('../seedData/createData.js');

exports.seed = function(knex) {
  return knex('users').del()
    .then(function() {
      return knex('users').insert(data.users);
    });
};