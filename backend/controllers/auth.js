/////////////653a4f922c3d8b345ca4066a

const express = require("express");
const user = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cookieParser());

const router = express.Router();
const winston = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

router.post("/register", async (req, res) => {
  //Handles user registeration

  try {
    const isExisting = await user.findOne({ email: req.body.email });
    if (isExisting) {
      return res.status(400).json({ error: "Email has already been used." });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new user({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );
    res.status(201).json({ message: "New user created" });
  } catch (error) {
    logger.error(`Error in register: ${error.message}`);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  // Handle login logic
  try {
    // Check if user exists
    console.log("Login request received");
    const existingUser = await user.findOne({ email: req.body.email });
    if (!existingUser) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    // Check if password is correct
    else {
      const validPass = await bcrypt.compare(
        req.body.password,
        existingUser.password
      );
      if (!validPass) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Generate JWT
      else {
        const token = jwt.sign(
          { id: existingUser._id, email: existingUser.email },
          process.env.JWT_SECRET,
          {
            expiresIn: "12h",
          }
        );
        // Save the token to a cookie and send a response
        res.cookie("token", token, { httpOnly: true });
        res.status(200).json({ message: "Logged in successfully" });
      }
    }
  } catch (error) {
    logger.error(`Error in login: ${error.message}`);

    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
