const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");

dotenv.config();

const port = 3000;
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DataBase is successfully connected");
  } catch (err) {
    console.error("Connection to the database failed:", err);
  }
}
connectToDatabase();

//Middleware and Routers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set(express.static("public"));
app.set("view engine", "ejs");
app.listen(3000, () =>
  console.log(`Server is connected successfully at port ${port}`)
);
