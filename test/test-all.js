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

describe('User Routes', function() {
	beforeEach(function(done) { // Setup tables and register a test user
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
	afterEach(function(done) { // Clear tables
	    knex.migrate.rollback()
	    .then(function() {
	      done();
	    });
	});
	describe('POST /api/users/register', function() {
		it('should register a new user', function(done) {
			chai.request(app)
			.post('/api/users/register')
			.send({
				email: 'testUser@gmail.com',
				password: '1234512345',
				first_name: 'Phil',
				last_name: 'Lutz',
				bio: 'This is my bio',
				private: 'false'
			})
			.then(function(res) {}) // This is an intentional error
			chai.request(app)
			.post('/api/users/register')
			.send({
				email: 'philiplutz413@gmail.com',
				password: '1234512345',
				first_name: 'Phil',
				last_name: 'Lutz',
				bio: 'This is my bio',
				private: 'false'
			})
			.end(function(err, res) {
				res.should.have.status(201);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal('User successfully registered');
				done();
			});
		});
	});
	describe('POST /api/users/login', function() {
		it('should login a user', function(done) {
			chai.request(app)
			.post('/api/users/login')
			.send({
				email: 'testUser@gmail.com',
				password: '123'
			})
			.then(function(res) {}) // This is an intentional error
			chai.request(app)
			.post('/api/users/login')
			.send({
				email: 'testUser@gmail.com',
				password: '12345'
			})
			.end(function(err, res) {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('token');
				res.body.token.should.be.a('string');
				done();
			});
		});
	});
	describe('GET /api/users/:user_id', function() {
		it('should return public information of a specific user to an authenticated user', function(done) {
			queries.getAllUsers()
			.then(function(users) {
				let testUserId = null;
				let anotherUserId = null;
				let testToken = null;
				for (let i=0; i<users.length; i++) {
					if (users[i].email === 'testUser@gmail.com') {
						testUserId = users[i].user_id;
					}	else {
						anotherUserId = users[i].user_id;
						testToken = Auth.generateToken(anotherUserId);
					}
					if (anotherUserId !== null && testToken !== null && testUserId !== null) {
						break;
					}
				}
				chai.request(app)
				.get(`/api/users/${testUserId}`)
				.then(function(res) {}) // This is an intentional error
				chai.request(app)
				.get(`/api/users/${testUserId}`)
				.set({'x-access-token': testToken})
				.end(function(err, res) {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('user_id');
					res.body.user_id.should.equal(testUserId);
					res.body.should.have.property('first_name');
					res.body.first_name.should.equal('Test');
					res.body.should.have.property('last_name');
					res.body.last_name.should.equal('User');
					res.body.should.have.property('bio');
					res.body.bio.should.equal('Test Bio');
					done();
				});
			});
		});
	});
	describe('PUT /api/users/', function() {
		it('should update the information of the user making the request', function(done) {
			chai.request(app)
			.put('/api/users')
			.send({
				bio: 'There is no user associated with this request so it should fail'
			})
			.then(function(res) {}) // This is an intentional error
			queries.getAllUsers()
			.then(function(users) {
				const testUserId = users[0].user_id;
				const testToken = Auth.generateToken(testUserId);
				chai.request(app)
				.put('/api/users')
				.set({'x-access-token': testToken})
				.send({
					bio: 'I modified my bio to have more words'
				})
				.end(function(err, res) {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('User information successfully updated');
					done();
				});
			});
		});
	});
	describe('DELETE /api/users/:user_id', function() {
		it('should only allow an admin to delete a user', function(done) {
			const hashPassword = Auth.hashPassword('12345');
		    const testAdminUser = [{
		   		user_id: uuidv4(),
				email: 'testAdminUser@gmail.com',
				password: hashPassword,
				first_name: 'Test',
				last_name: 'Admin',
				bio: 'Test Bio',
				private: 'false',
				admin: 'true',
				created_date: moment(new Date()),
				modified_date: moment(new Date())
		    }];
		    const adminId = testAdminUser[0].user_id;
		    queries.addUser(testAdminUser)
		   	.then(function() {
		   		let testToken = null;
		   		let testUserId = null;
		   		queries.getAllUsers()
		   		.then(function(users) {
		   			for (let i=0; i<users.length; i++) {
		   				if (users[i].admin === false) {
		   					testUserId = users[i].user_id;
		   				}
		   			}
		   			testToken = Auth.generateToken(testUserId);
		   			chai.request(app)
		   			.delete(`/api/users/${adminId}`)
		   			.set({'x-access-token': testToken})
		   			.then(function(res) {}) // This is an intentional error
		   			testToken = Auth.generateToken(adminId);
		   			chai.request(app)
		   			.delete(`/api/users/${testUserId}`)
		   			.set({'x-access-token': testToken})
		  			.end(function(err, res) {
	 					res.should.have.status(200);
		   				res.body.should.be.a('object');
						res.body.should.have.property('message');
						res.body.message.should.equal('User successfully deleted');
						done();
		   			});
		   		});
		   	});
		});
	});
});

describe('Grade Routes', function() {
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
			.then(function(res) {}) // This is an intentional error
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
	describe('GET /api/grades/one', function() {
		it('should return a specific grade to an authenticated user', function(done) {
			chai.request(app)
			.get('/api/grades/one')
			.send({
				encrypted_string: 'this string that will fail'
			})
			.then(function(res) {}) // This is an intentional error
			queries.getUserEmail('testUser@gmail.com')
			.then(function(user) {
				const testToken = Auth.generateToken(user.user_id);
				const testId = user.user_id;
				queries.getAllGrades()
				.then(function(grades) {
					const testGrade = grades[0];
					chai.request(app)
					.get('/api/grades/one')
					.set({'x-access-token': testToken})
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
					})
				})
			})
		});
	});
	describe('GET /api/grades/all/:user_id', function() {
		it('should return all grades of a specific user to an authenticated user', function(done) {
			const fakeString = Auth.hashPassword('fakeString');
			chai.request(app)
			.get(`/api/grades/all/${fakeString}`)
			.then(function(res) {}) // This is an intentional error
			.then(function() {
				let testToken = null;
				let testId = null;
				queries.getUserEmail('testUser@gmail.com')
				.then(function(user) {
					testToken = Auth.generateToken(user.user_id);
					testId = user.user_id;
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
						.get(`/api/grades/all/${testId}`)
						.set({'x-access-token': testToken})
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
	describe('POST /api/grades/', function() {
		it('should create a new grade', function(done) {
			const decrypted_string = "12345";
			const encrypted_string = Auth.hashPassword(decrypted_string);
			chai.request(app)
			.post('/api/grades')
			.send({
				decrypted_string: decrypted_string,
				encrypted_string: encrypted_string
			})
			.then(function(res) {}) // This is an intentional error
			let testToken = null;
			queries.getAllUsers()
			.then(function(users) {
				for (let i=0; i<users.length; i++) {
					if (users[i].email === 'testUser@gmail.com') {
						testToken = Auth.generateToken(users[i].user_id);
					}
				}
				chai.request(app)
				.post('/api/grades')
				.send({
					decrypted_string: decrypted_string,
					encrypted_string: encrypted_string
				})
				.set({'x-access-token': testToken})
				.end(function(err, res) {
					res.should.have.status(201);
					res.body.should.be.a('object');
					res.body.should.have.property('message');
					res.body.message.should.equal('Grade successfully added to database')
					done();
				});
			});
		});
	});
	describe('PUT /api/grades/:grade_id', function() {
		it('should update a grade of the user making the request', function(done) {
			queries.getUserEmail('testUser@gmail.com')
			.then(function(user) {
				const testToken = Auth.generateToken(user.user_id);
				const testId = user.user_id;
				queries.getAllGrades()
				.then(function(grades) {
					const gradeToUpdate = grades[0].grade_id;
					chai.request(app)
					.put(`/api/grades/${gradeToUpdate}`)
					.set({'x-access-token': testToken})
					.send({
						decrypted_string: "54321"
					})
					.then(function(res) {}) // This is an intentional error
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
					const gradeId = testGrade[0].grade_id;
					queries.addGrade(testGrade)
					.then(function() {
						chai.request(app)
						.put(`/api/grades/${gradeId}`)
						.set({'x-access-token': testToken})
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
		it('should delete a grade of the user making the request', function(done) {
			queries.getUserEmail('testUser@gmail.com')
			.then(function(user) {
				const testToken = Auth.generateToken(user.user_id);
				const testId = user.user_id;
				queries.getAllGrades()
				.then(function(grades) {
					const gradeToDelete = grades[0].grade_id;
					chai.request(app)
					.delete(`/api/grades/${gradeToDelete}`)
					.set({'x-access-token': testToken})
					.then(function(res) {}) // This is an intentional error
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
					const gradeId = testGrade[0].grade_id;
					queries.addGrade(testGrade)
					.then(function() {
						chai.request(app)
						.delete(`/api/grades/${gradeId}`)
						.set({'x-access-token': testToken})
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