const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const expect = chai.expect;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { user1, user2, user3, user4, user5 } = require("./testData/user");
chai.use(chaiHttp);

describe("User Routes", function () {
  let authToken;

  it("should register a new user", function (done) {
    request(app)
      .post("/auth/register")
      .send({
        username: "testuser",
        email: "testuser@example.com",
        password: "testpassword",
      })
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property("message", "New user created");
        done();
      });
  });

  it("should not register with incomplete details", function (done) {
    request(app)
      .post("/auth/register")
      .send({
        username: "testuser",
        email: "testuser@example.com",
      })
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property("error", "Registration failed");
        done();
      });
  });

  it("should not register with existing details", function (done) {
    request(app)
      .post("/auth/register")
      .send({
        username: "testuser",
        email: "testuser@example.com",
        password: "testpassword",
      })
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property(
          "error",
          "Email has already been used."
        );
        done();
      });
  });

  it("should log in a user", function (done) {
    request(app)
      .post("/auth/login")
      .send({
        email: "testuser@example.com",
        password: "testpassword",
      })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        authToken = res.header["set-cookie"][0];
        done();
      });
  });

  it("should not log in with incomplete details", function (done) {
    request(app)
      .post("/auth/login")
      .send({
        email: "testuser@example.com",
      })
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property("error", "Invalid email or password");
        done();
      });
  });

  it("should not log in with incorrect details", function (done) {
    request(app)
      .post("/auth/login")
      .send({
        email: "testuser@example.com",
        password: "wrongpassword",
      })
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property("error", "Invalid email or password");
        done();
      });
  });

  it("should not log in with new details", function (done) {
    request(app)
      .post("/auth/login")
      .send({
        email: "newuser@example.com",
        password: "newpassword",
      })
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property("error", "Invalid email or password");
        done();
      });
  });

  // After all tests, you can use the authToken for authorized requests
  after(function (done) {
    request(app)
      .post("/auth/logout")
      .set("Cookie", [authToken])
      .expect(302)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });
});
