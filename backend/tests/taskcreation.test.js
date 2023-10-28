const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const expect = chai.expect;
const mongoose = require("mongoose");

chai.use(chaiHttp);

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
      const res = await chai
        .request(server)
        .post("/task")
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1M2E0ZTZhODEzOTU4Njk4OGQwNTkyZSIsImVtYWlsIjoibWFiaWxhd29uQGdtYWlsLmNvbSIsImlhdCI6MTY5ODQ3NTU2NywiZXhwIjoxNjk4NTE4NzY3fQ.NMkyY0aNPEexVxy7jcWNBVjVRuLDFEO-6rhA7HO3XO8"
        )
        .send({ name: "Test Task", description: "This is a test task" });

      expect(res).to.have.status(201);
      expect(res.body).to.be.an("object");
      expect(res.body.name).to.equal("Test Task");
      expect(res.body.description).to.equal("This is a test task");
    });

    it("should return an error when creating a task with missing fields", async function () {
      const res = await chai
        .request(server)
        .post("/task")
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1M2E0ZTZhODEzOTU4Njk4OGQwNTkyZSIsImVtYWlsIjoibWFiaWxhd29uQGdtYWlsLmNvbSIsImlhdCI6MTY5ODQ3NTU2NywiZXhwIjoxNjk4NTE4NzY3fQ.NMkyY0aNPEexVxy7jcWNBVjVRuLDFEO-6rhA7HO3XO8"
        )
        .send({ description: "Incomplete Task" });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("msg");
    });
  });
});
