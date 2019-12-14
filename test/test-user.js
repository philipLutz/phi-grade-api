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

describe('User Routes', function() {
	beforeEach(function(done) { // CREATE tables, seed database, and register a test user
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
	describe('POST /api/users/register', function() {
		it('should prevent a user from signing up with an existing email address', function(done) {
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
			.end(function(err, res) {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal('Please enter a different email address');
				done();
			});
		});
	});
	describe('POST /api/users/register', function() {
		it('should register a new user', function(done) {
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
		it('should not authenticate a user using an incorrect password', function(done) {
			chai.request(app)
			.post('/api/users/login')
			.send({
				email: 'testUser@gmail.com',
				password: '123'
			})
			.end(function(err, res) {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal('The credentials you provided are incorrect');
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
				password: '12345'
			})
			.end(function(err, res) {
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.message.should.equal('Login success');
				done();
			});
		});
	});
	describe('GET /api/users/:user_id', function() {
		it('should deny request from an unauthenticated user', function(done) {
			queries.getUserEmail('testUser@gmail.com')
			.then(function(user) {
				const testUserId = user.user_id;
				chai.request(app)
				.get(`/api/users/${testUserId}`)
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
	describe('GET /api/users/:user_id', function() {
		it('should return public information of a specific user to an authenticated user', function(done) {
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
				chai.request(app)
				.post('/api/users/login')
				.send({
					email: 'testUser@gmail.com',
					password: '12345'
				})
				.then(function(res) {
					const testCookieToken = res.headers['set-cookie'][0].substring(6);
					chai.request(app)
					.get(`/api/users/${anotherUser.user_id}`)
					.set({'set-cookie': testCookieToken})
					.end(function(err, res) {
						res.should.have.status(200);
						res.body.should.be.a('object');
						res.body.should.have.property('user_id');
						res.body.user_id.should.equal(anotherUser.user_id);
						res.body.should.have.property('first_name');
						res.body.first_name.should.equal(anotherUser.first_name);
						res.body.should.have.property('last_name');
						res.body.last_name.should.equal(anotherUser.last_name);
						res.body.should.have.property('bio');
						res.body.bio.should.equal(anotherUser.bio);
						done();
					});
				});
			});
		});
	});
	describe('PUT /api/users', function() {
		it('should deny request from an unauthenticated user', function(done) {
			chai.request(app)
			.put('/api/users')
			.send({
				bio: 'There is no user associated with this request so it should fail'
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
	describe('PUT /api/users', function() {
		it('should update the information of the user making the request', function(done) {
			chai.request(app)
			.post('/api/users/login')
			.send({
				email: 'testUser@gmail.com',
				password: '12345'
			})
			.then(function(res) {
				const testCookieToken = res.headers['set-cookie'][0].substring(6);
				chai.request(app)
				.put('/api/users')
				.set({'set-cookie': testCookieToken})
				.send({
					bio: 'I modified my bio to be these words.'
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
		it('should prevent user deletion without being an admin', function(done) {
			queries.getAllUsers()
			.then(function(users) {
				let anotherUser = null;
				for (let i=0; i<users.length; i++) {
					if (users[i].email !== 'testUser@gmail.com' && users[i].admin === false) {
						anotherUser = users[i];
					}	else {
						break;
					}
				}
				chai.request(app)
				.post('/api/users/login')
				.send({
					email: 'testUser@gmail.com',
					password: '12345'
				})
				.then(function(res) {
					const testCookieToken = res.headers['set-cookie'][0].substring(6);
					chai.request(app)
					.delete(`/api/users/${anotherUser.user_id}`)
					.set({'set-cookie': testCookieToken})
					.end(function(err, res) {
						res.should.have.status(401);
						res.body.should.be.a('object');
						res.body.should.have.property('message');
						res.body.message.should.equal('You do not have access to delete users');
						done();
					});
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
					bio: 'Test Admin Bio',
					private: 'false',
					admin: 'true',
					created_date: moment(new Date()),
					modified_date: moment(new Date())
			}];
			queries.addUser(testAdminUser)
		   	.then(function() {
		   		queries.getUserEmail('testUser@gmail.com')
		   		.then(function(user) {
		   			const testUser = user;
						chai.request(app)
						.post('/api/users/login')
						.send({
							email: 'testAdminUser@gmail.com',
							password: '12345'
						})
						.then(function(res) {
							const testCookieToken = res.headers['set-cookie'][0].substring(6);
							chai.request(app)
			   			.delete(`/api/users/${testUser.user_id}`)
			   			.set({'set-cookie': testCookieToken})
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
});
