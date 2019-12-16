const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const chai = require('chai');
const faker = require('faker');
const server = require('../../../index');

/* eslint prefer-destructuring: 0 */
const expect = chai.expect;
chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## Book APIs', () => {
  let user = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
  };

  let news = {
    title: faker.name.findName(),
    description: faker.random.alphaNumeric(11),
  };

  describe('# POST /api/v1/auth/register', () => {
    it('should create a new user for creating news', (done) => {
      request(server)
        .post('/api/v1/auth/register')
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.token).to.not.equal('');
          expect(res.body.token).to.not.equal(undefined);
          expect(res.body.user.email).to.equal(user.email);
          expect(res.body.user.firstName).to.equal(user.firstName);
          expect(res.body.user.lastName).to.equal(user.lastName);
          expect(res.body.user.password).to.equal(undefined); // Password should be removed.
          user = res.body.user;
          user.token = res.body.token;
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/v1/news', () => {
    it('should create a new news', (done) => {
      news.owner = user._id; // Setting created user as owner.
      request(server)
        .post('/api/v1/news')
        .send(news)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.owner).to.equal(news.owner);
          expect(res.body.title).to.equal(news.title);
          expect(res.body.description).to.equal(news.description);
          news = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/v1/news/:newsId', () => {
    it('should get news details', (done) => {
      request(server)
        .get(`/api/v1/news/${news._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.owner._id).to.equal(user._id);
          expect(res.body.title).to.equal(news.title);
          expect(res.body.description).to.equal(news.description);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when news does not exists', (done) => {
      request(server)
        .get('/api/v1/news/56c787ccc67fc16ccc1a5e92')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('No such news exists!');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/v1/news/:newsId', () => {
    it('should update news details', (done) => {
      news.title = faker.name.findName();
      request(server)
        .put(`/api/v1/news/${news._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .send(news)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.owner._id).to.equal(user._id);
          expect(res.body.title).to.equal(news.title);
          expect(res.body.description).to.equal(news.description);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/v1/news/', () => {
    it('should get all books', (done) => {
      request(server)
        .get('/api/v1/news')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/v1/news/', () => {
    it('should delete news', (done) => {
      request(server)
        .delete(`/api/v1/news/${news._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.owner._id).to.equal(user._id);
          expect(res.body.title).to.equal(news.title);
          expect(res.body.description).to.equal(news.description);
          done();
        })
        .catch(done);
    });
  });

  describe('# Error Handling', () => {
    it('should handle express validation error - description is required', (done) => {
      request(server)
        .post('/api/v1/news')
        .send({
          title: faker.name.findName(),
          owner: user._id,
        })
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"description" is required');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/v1/users/', () => {
    it('should delete user after done with books testing', (done) => {
      request(server)
        .delete(`/api/v1/users/${user._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email).to.equal(user.email);
          expect(res.body.firstName).to.equal(user.firstName);
          expect(res.body.lastName).to.equal(user.lastName);
          expect(res.body.password).to.equal(undefined); // Password should be removed.
          done();
        })
        .catch(done);
    });
  });
});
