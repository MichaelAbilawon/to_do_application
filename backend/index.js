const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");
const router = require("./controllers/auth");
const taskRouter = require("./controllers/task");
const path = require("path");
const ejs = require("ejs");

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
app.set("views", path.join(__dirname, "views")); //directory for views
app.set("views", path.join(__dirname, "views")); //Serve static assests from the "public" directory
app.use("/auth", router);
app.use("/task", taskRouter);
app.get("/", (req, res) => {
  res.render("homepage");
});

//Listen on Port
app.listen(3000, () =>
  console.log(`Server is connected successfully at port ${port}`)
);

module.exports = app;
