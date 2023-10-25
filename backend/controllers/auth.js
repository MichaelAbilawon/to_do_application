const express = require("express");
const user = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cookieParser());

const { log } = require("winston");
const winston = require("winston/lib/winston/config");
const router = express.Router();

router.post("/register", async (req, res) => {
  //Handles user registeration

  try {
    const isExisting = await user.findOne({ email: req.body.email });
    if (isExisting) {
      return res.status(400).json({ error: "Email has already been used." });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new user({
      username: req.body.firstname,
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
    winston.error(`Error in register: ${error.message}`);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  // Handle login logic
  try {
    // Check if user exists
    console.log("Login request received");
    const user = await user.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    // Check if password is correct
    else {
      const validPass = bcrypt.compareSync(req.body.password, user.password);
      if (!validPass) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Generate JWT
      else {
        const token = jwt.sign(
          { id: user._id, email: user.email },
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
    winston.error(`Error in login: ${error.message}`);

    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
