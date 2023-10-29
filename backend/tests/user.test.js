const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const expect = chai.expect;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { user1, user2, user3, user4, user5 } = require("./testData/user");
chai.use(chaiHttp);

describe("POST /auth/register", () => {
  it("should register a new user with valid data", async () => {
    const user = {};
  });
});
