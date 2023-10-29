const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const expect = chai.expect;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

chai.use(chaiHttp);

async function login() {
  const res = await chai
    .request(server)
    .post("/auth/login")
    .send({ email: "test1@test.com", password: "test&test" });
  const token = res.body.token;

  //Verify the token
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("Error verifying token:", err);
    throw err;
  }

  return token;
}

describe("Todo API Endpoints", function () {
  this.timeout(5000);

  before(async function () {
    try {
      await mongoose.connect(process.env.MONGO_URL);
      console.log("DataBase is successfully connected");
    } catch (err) {
      console.error("Connection to the database failed:", err);
      throw err;
    }
  });

  describe("Task creation", function () {
    this.timeout(10000);

    it("should create a new task", async function () {
      const token = await login();
      const res = await chai
        .request(server)
        .post("/task")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test Task", description: "This is a test task" });

      expect(res).to.have.status(201);
      expect(res.body).to.be.an("object");
      expect(res.body.name).to.equal("Test Task");
      expect(res.body.description).to.equal("This is a test task");
    });

    it("should return an error when creating a task with missing fields", async function () {
      const token = await login();
      const res = await chai
        .request(server)
        .post("/task")
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "Incomplete Task" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("msg");
    });
  });
});
