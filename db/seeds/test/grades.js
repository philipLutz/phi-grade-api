const data = require('../seedData/createData.js');

exports.seed = function(knex) {
  return knex('grades').del()
    .then(function() {
      return knex('grades').insert(data.grades);
    });
};
