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

	// Setup tables and register a test user
	beforeEach(function(done) {
	    knex.migrate.rollback()
	    .then(function() {
	    	knex.migrate.latest()
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
		    	})
	    	})
	    })
	});

	// Clear tables
	afterEach(function(done) {
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
		it('should return public information of a specific user', function(done) {
			let testToken = null;
			let testUserId = null;
			queries.getAllUsers()
			.then(function(users) {
				testUserId = users[0].user_id;
				testToken = Auth.generateToken(testUserId);
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
			let testToken = null;
			let testUserId = null;
			queries.getAllUsers()
			.then(function(users) {
				testUserId = users[0].user_id;
				testToken = Auth.generateToken(testUserId);
				chai.request(app)
				.put('/api/users/')
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
		   	.then(function(done) {
		   		let testToken = null;
		   		let testUserId = null;
		   		queries.getAllUsers()
		   		.then(function(users) {
		   			for (let i=0; i<users.length; i++) {
		   				if (users[i].admin === false) {
		   					testUserId = users[i].user_id;
		   				}
		   			}
		   			// Our first request will be made from a non admin user and it should fail
		   			testToken = Auth.generateToken(testUserId);
		   			chai.request(app)
		   			.delete(`/api/users/${adminId}`)
		   			.set({'x-access-token': testToken})
		   			.then(function(res) {
		   				// Res should be undefined because we are purposely making a bad request
		   			})
		   			.catch(function(res) {
		   				console.log(res.body);
		   				res.should.have.status(401);
		   				res.body.should.be.a('object');
						res.body.should.have.property('message');
						res.body.message.should.equal('You do not have access to delete users');
		   			})
		   			.then(function() {
		   				testToken = Auth.generateToken(adminId);
		   				chai.request(app)
		   				.delete(`/api/users/${testUserId}`)
		   				.set({'x-access-token': testToken})
		   				.end(function(err, res) {
		   					res.should.have.status(200);
		   					res.body.should.be.a('object');
							res.body.should.have.property('message');
							res.body.message.should.equal('User successfully deleted');
		   				});
		   			});
		   		});
		   	});
		   	done();
		});
	});
});