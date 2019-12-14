process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const cookieParser = require('cookie-parser');
const app = require('../server.js');
const knex = require('../db/knex.js');
const queries = require('../db/queries.js');
const Auth = require('../auth/authentication.js');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const should = chai.should();

chai.use(chaiHttp);

describe('Grade Routes', function() { // CREATE tables, seed database, and register a test user
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
	afterEach(function(done) { // DROP tables
	    knex.migrate.rollback()
	    .then(function() {
	      done();
	    });
	});
	describe('GET /api/grades', function() {
		it('should deny request from an unauthenticated user', function(done) {
			chai.request(app)
			.get('/api/grades')
			.end(function(err, res) {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal('Token is not provided');
				done();
			});
		});
	});
	describe('GET /api/grades', function() {
		it('should return all grades to an authenticated user', function(done) {
			chai.request(app)
			.post('/api/users/login')
			.send({
				email: 'testUser@gmail.com',
				password: '12345'
			})
			.then(function(res) {
				const testCookieToken = res.headers['set-cookie'][0].substring(6);
				chai.request(app)
				.get('/api/grades/')
				.set({'set-cookie': testCookieToken})
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
	describe('GET /api/grades/one', function() {
		it('should deny request from an unauthenticated user', function(done) {
			chai.request(app)
			.get('/api/grades/one')
			.send({
				encrypted_string: 'this string that will fail'
			})
			.end(function(err, res) {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal('Token is not provided');
				done();
			});
		});
	});
	describe('GET /api/grades/one', function() {
		it('should return a specific grade to an authenticated user', function(done) {
			chai.request(app)
			.post('/api/users/login')
			.send({
				email: 'testUser@gmail.com',
				password: '12345'
			})
			.then(function(res) {
				const testCookieToken = res.headers['set-cookie'][0].substring(6);
				queries.getAllGrades()
				.then(function(grades) {
					const testGrade = grades[0];
					chai.request(app)
					.get('/api/grades/one')
					.set({'set-cookie': testCookieToken})
					.send({
						encrypted_string: testGrade.encrypted_string
					})
					.end(function(err, res) {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('grade_id');
						res.body.grade_id.should.be.equal(testGrade.grade_id);
						res.body.should.have.property('user_id');
						res.body.user_id.should.equal(testGrade.user_id);
						res.body.should.have.property('decrypted_string');
						res.body.decrypted_string.should.equal(testGrade.decrypted_string);
						res.body.should.have.property('encrypted_string');
						res.body.encrypted_string.should.equal(testGrade.encrypted_string);
						done();
					});
				});
			});
		});
	});
	describe('GET /api/grades/all/:user_id', function() {
		it('should deny request from an unauthenticated user', function(done) {
			queries.getUserEmail('testUser@gmail.com')
			.then(function(user) {
				const testUserId = user.user_id;
				chai.request(app)
				.get(`/api/grades/all/${testUserId}`)
				.end(function(err, res) {
					res.should.have.status(400);
					res.body.should.be.a('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Token is not provided');
					done();
				});
			});
		});
	});
	describe('GET /api/grades/all/:user_id', function() {
		it('should return all grades of a specific user to an authenticated user', function(done) {
			queries.getUserEmail('testUser@gmail.com')
			.then(function(user) {
				const testId = user.user_id;
				const decrypted_string = "12345";
				const encrypted_string = Auth.hashPassword(decrypted_string);
				const testGrade = [{
					grade_id: uuidv4(),
					user_id: testId,
					decrypted_string: decrypted_string,
					encrypted_string: encrypted_string,
					created_date: moment(new Date()),
					modified_date: moment(new Date())
				}];
				queries.addGrade(testGrade)
				.then(function() {
					chai.request(app)
					.post('/api/users/login')
					.send({
						email: 'testUser@gmail.com',
						password: '12345'
					})
					.then(function(res) {
						const testCookieToken = res.headers['set-cookie'][0].substring(6);
						chai.request(app)
						.get(`/api/grades/all/${testId}`)
						.set({'set-cookie': testCookieToken})
						.end(function(err, res) {
							res.should.have.status(200);
							res.body.should.be.a('array');
							res.body[0].should.have.property('grade_id');
							res.body[0].grade_id.should.be.a('string');
							res.body[0].should.have.property('user_id');
							res.body[0].user_id.should.equal(testId);
							res.body[0].should.have.property('decrypted_string');
							res.body[0].decrypted_string.should.equal('12345')
							res.body[0].should.have.property('encrypted_string');
							res.body[0].encrypted_string.should.equal(encrypted_string);
							done();
						});
					});
				});
			});
		});
	});
	describe('POST /api/grades', function() {
		it('should deny request from an unauthenticated user', function(done) {
			const decrypted_string = "12345";
			const encrypted_string = Auth.hashPassword(decrypted_string);
			chai.request(app)
			.post('/api/grades')
			.send({
				decrypted_string: decrypted_string,
				encrypted_string: encrypted_string
			})
			.end(function(err, res) {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal('Token is not provided');
				done();
			});
		});
	});
	describe('POST /api/grades', function() {
		it('should create a new grade', function(done) {
			chai.request(app)
			.post('/api/users/login')
			.send({
				email: 'testUser@gmail.com',
				password: '12345'
			})
			.then(function(res) {
				const testCookieToken = res.headers['set-cookie'][0].substring(6);
				const decrypted_string = "12345";
				const encrypted_string = Auth.hashPassword(decrypted_string);
				chai.request(app)
				.post('/api/grades')
				.send({
					decrypted_string: decrypted_string,
					encrypted_string: encrypted_string
				})
				.set({'set-cookie': testCookieToken})
				.end(function(err, res) {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Grade successfully added to database');
					done();
				});
			});
		});
	});
	describe('PUT /api/grades/:grade_id', function() {
		it('should not allow a user to update a grade of another user', function(done) {
			queries.getAllUsers()
			.then(function(users) {
				let anotherUser = null;
				for (let i=0; i<users.length; i++) {
					if (users[i].email !== 'testUser@gmail.com') {
						anotherUser = users[i];
					}	else {
						break;
					}
				}
				const decrypted_string = "12345";
				const encrypted_string = Auth.hashPassword(decrypted_string);
				const testGrade = [{
					grade_id: uuidv4(),
					user_id: anotherUser.user_id,
					decrypted_string: decrypted_string,
					encrypted_string: encrypted_string,
					created_date: moment(new Date()),
					modified_date: moment(new Date())
				}];
				const gradeId = testGrade[0].grade_id;
				queries.addGrade(testGrade)
				.then(function() {
					chai.request(app)
					.post('/api/users/login')
					.send({
						email: 'testUser@gmail.com',
						password: '12345'
					})
					.then(function(res) {
						const testCookieToken = res.headers['set-cookie'][0].substring(6);
						chai.request(app)
						.put(`/api/grades/${gradeId}`)
						.set({'set-cookie': testCookieToken})
						.send({
							decrypted_string: "54321"
						})
						.end(function(err, res) {
							res.should.have.status(401);
							res.body.should.be.a('object');
							res.body.should.have.property('message');
							res.body.message.should.equal('Unauthorized request to update grade');
							done();
						});
					});
				});
			});
		});
	});
	describe('PUT /api/grades/:grade_id', function() {
		it('should update a grade of the user making the request', function(done) {
			queries.getUserEmail('testUser@gmail.com')
			.then(function(user) {
				const decrypted_string = "12345";
				const encrypted_string = Auth.hashPassword(decrypted_string);
				const testGrade = [{
					grade_id: uuidv4(),
					user_id: user.user_id,
					decrypted_string: decrypted_string,
					encrypted_string: encrypted_string,
					created_date: moment(new Date()),
					modified_date: moment(new Date())
				}];
				const gradeId = testGrade[0].grade_id;
				queries.addGrade(testGrade)
				.then(function() {
					chai.request(app)
					.post('/api/users/login')
					.send({
						email: 'testUser@gmail.com',
						password: '12345'
					})
					.then(function(res) {
						const testCookieToken = res.headers['set-cookie'][0].substring(6);
						chai.request(app)
						.put(`/api/grades/${gradeId}`)
						.set({'set-cookie': testCookieToken})
						.send({
							decrypted_string: "54321"
						})
						.end(function(err, res) {
							res.should.have.status(200);
							res.body.should.be.a('object');
							res.body.should.have.property('message');
							res.body.message.should.equal('Grade successfully updated');
							done();
						});
					});
				});
			});
		});
	});
	describe('DELETE /api/grades/:grade_id', function() {
		it('should not allow a user to delete the grade of another user', function(done) {
			queries.getAllUsers()
			.then(function(users) {
				let anotherUser = null;
				for (let i=0; i<users.length; i++) {
					if (users[i].email !== 'testUser@gmail.com') {
						anotherUser = users[i];
					}	else {
						break;
					}
				}
				const decrypted_string = "12345";
				const encrypted_string = Auth.hashPassword(decrypted_string);
				const testGrade = [{
					grade_id: uuidv4(),
					user_id: anotherUser.user_id,
					decrypted_string: decrypted_string,
					encrypted_string: encrypted_string,
					created_date: moment(new Date()),
					modified_date: moment(new Date())
				}];
				const gradeId = testGrade[0].grade_id;
				queries.addGrade(testGrade)
				.then(function() {
					chai.request(app)
					.post('/api/users/login')
					.send({
						email: 'testUser@gmail.com',
						password: '12345'
					})
					.then(function(res) {
						const testCookieToken = res.headers['set-cookie'][0].substring(6);
						chai.request(app)
						.delete(`/api/grades/${gradeId}`)
						.set({'set-cookie': testCookieToken})
						.end(function(err, res) {
							res.should.have.status(401);
							res.body.should.be.a('object');
							res.body.should.have.property('message');
							res.body.message.should.equal('Unauthorized request to delete grade');
							done();
						});
					});
				});
			});
		});
	});
	describe('DELETE /api/grades/:grade_id', function() {
		it('should delete a grade of the user making the request', function(done) {
			queries.getUserEmail('testUser@gmail.com')
			.then(function(user) {
				const decrypted_string = "12345";
				const encrypted_string = Auth.hashPassword(decrypted_string);
				const testGrade = [{
					grade_id: uuidv4(),
					user_id: user.user_id,
					decrypted_string: decrypted_string,
					encrypted_string: encrypted_string,
					created_date: moment(new Date()),
					modified_date: moment(new Date())
				}];
				const gradeId = testGrade[0].grade_id;
				queries.addGrade(testGrade)
				.then(function() {
					chai.request(app)
					.post('/api/users/login')
					.send({
						email: 'testUser@gmail.com',
						password: '12345'
					})
					.then(function(res) {
						const testCookieToken = res.headers['set-cookie'][0].substring(6);
						chai.request(app)
						.delete(`/api/grades/${gradeId}`)
						.set({'set-cookie': testCookieToken})
						.end(function(err, res) {
							res.should.have.status(200);
							res.body.should.be.a('object');
							res.body.should.have.property('message');
							res.body.message.should.equal('Grade successfully deleted');
							done();
						});
					});
				});
			});
		});
	});
});
