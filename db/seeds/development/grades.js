const data = require('../seedData/gradesData.js');

exports.seed = function(knex) {
  return knex('grades').del()
    .then(function() {
      return knex('grades').insert(data);
    });
};
