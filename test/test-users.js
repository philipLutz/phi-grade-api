process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server.js');
const knex = require('../db/knex.js');
const should = chai.should();

chai.use(chaiHttp);