process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server.js');
const knex = require('../db/knex.js');
const queries = require('../db/queries.js');
const Auth = require('../auth/authentication.js');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const should = chai.should();

chai.use(chaiHttp);

describe('Grade Routes', function() {

	// Setup tables and register a test user
	beforeEach(function(done) {
	    knex.migrate.rollback()
	    .then(function() {
	    	knex.migrate.latest()
	    	.then(function() {
	    		knex.seed.run()
	    		.then(function() {
	    			const hashPassword = Auth.hashPassword('12345');
			    	const testUser = [{
			    		user_id: uuidv4(),
						email: 'testUser@gmail.com',
						password: hashPassword,
						first_name: 'Test',
						last_name: 'User',
						bio: 'Test Bio',
						private: 'false',
						admin: 'false',
						created_date: moment(new Date()),
						modified_date: moment(new Date())
			    	}];
			    	queries.addUser(testUser)
			    	.then(function() {
			    		done();
			    	});
		    	});
	    	});
	    });
	});

	// Clear tables
	afterEach(function(done) {
	    knex.migrate.rollback()
	    .then(function() {
	      done();
	    });
	});

	describe('GET /api/grades', function() {
		it('should return all grades to an authenticated user', function(done) {
			chai.request(app)
			.get('/api/grades')
			.then(function(res) {
				// This should be an error going to .catch()
			})
			.catch(function(err) {})
			.then(function() {
				let testToken = null;
				queries.getAllUsers()
				.then(function(users) {
					for (let i=0; i<users.length; i++) {
						if (users[i].email === 'testUser@gmail.com') {
							testToken = Auth.generateToken(users[i].user_id);
						}
					}
					chai.request(app)
					.get('/api/grades/')
					.set({'x-access-token': testToken})
					.end(function(err, res) {
						res.should.have.status(200);
						res.body.should.be.a('array');
						res.body.length.should.equal(6);
						res.body[0].should.have.property('grade_id');
						res.body[0].should.have.property('user_id');
						res.body[0].should.have.property('decrypted_string');
						res.body[0].should.have.property('encrypted_string');
						res.body[0].should.have.property('created_date');
						res.body[0].should.have.property('modified_date');
						done();
					});
				});
			});
		});
	});

	describe('GET /api/grades/:encrypted_string', function() {
		it('should return a specific grade to an authenticated user', function(done) {
			const fakeString = Auth.hashPassword('fakeString');
			chai.request(app)
			.get(`/api/grades/one/${fakeString}`)
			.then(function(res) {
				// This should be an error going to .catch()
			})
			.catch(function(err) {

			})
			.then(function() {
				let testToken = null;
				let testString = null;
				queries.getAllUsers()
				.then(function(users) {
					for (let i=0; i<users.length; i++) {
						if (users[i].email === 'testUser@gmail.com') {
							testToken = Auth.generateToken(users[i].user_id);
						}
					}
					queries.getAllGrades()
					.then(function(grades) {
						testString = grades[0].encrypted_string;
						chai.request(app)
						.get(`/api/grades/one/${testString}`)
						.set({'x-access-token': testToken})
						.end(function(err, res) {
							console.log(res.body);
							res.should.have.status(200);
						})
					})
				})
			})
		});
	});

	// describe('GET /api/grades/all/:user_id', function() {
	// 	it('should return all grades of a specific user to an authenticated user', function(done) {

	// 	});
	// });

	// describe('POST /api/grades/', function() {
	// 	it('should create a new grade', function(done) {

	// 	});
	// });

	// describe('PUT /api/grades/:grade_id', function() {
	// 	it('should update a grade of the user making the request', function(done) {

	// 	});
	// });

	// describe('DELETE /api/grades/:grade_id', function() {
	// 	it('should delete a grade of the user making the request', function(done) {

	// 	});
	// });
});