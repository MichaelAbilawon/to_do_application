const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const should = chai.should();
const expect = chai.expect;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
chai.use(chaiHttp);

const request = require("supertest");

describe("Task Routes", function () {
  let authToken;

  before(function (done) {
    // Perform login to get the authToken
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

  it("should get all tasks", function (done) {
    request(app)
      .get("/task/mytasks")
      .set("Cookie", [authToken])
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an("array");
        done();
      });
  });

  it("should update a task", function (done) {
    request(app)
      .put("/task/update/your-task-id")
      .set("Cookie", [authToken])
      .send({ state: "completed" })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property("state", "completed");
        done();
      });
  });

  it("should delete a task", function (done) {
    request(app)
      .delete("/task/delete/your-task-id")
      .set("Cookie", [authToken])
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property("msg", "Task Successfully deleted");
        done();
      });
  });

  it("should read a particular task", function (done) {
    request(app)
      .get("/task/view/your-task-id")
      .set("Cookie", [authToken])
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.property("name");
        expect(res.body).to.have.property("description");
        done();
      });
  });
});
