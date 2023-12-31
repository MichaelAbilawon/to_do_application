const express = require("express");
const taskRouter = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const winston = require("./logger");
const Task = require("../models/task");
const cookieParser = require("cookie-parser");

// Create a task (GET route to render the task creatiuon form)
taskRouter.get("/create", verifyToken, (req, res) => {
  res.render("taskcreation");
});

//Create new task
taskRouter.post("/create", verifyToken, async (req, res) => {
  const { name, state, description } = req.body;
  const author = req.user.id;

  try {
    if (!name || !description) {
      return res.status(400).json({ msg: "Please enter important fields" });
    }

    //To ensure the user is logged in
    if (!req.user) {
      return res.status(403).json("You are not logged in");
    }

    //Create the new task
    const newTask = new Task({
      name,
      description,
      state: "pending", // Initially in draft state
      author,
      category: req.body.category,
      priority: req.body.priority,
      due_date: req.body.due_date,
    });

    // Save the new task
    const task = await newTask.save();

    // Log the creation of the task
    winston.info(`Task created by ${req.user.email}: ${name}`);

    //Render the success view
    res.render("taskcreated", { task });
  } catch (error) {
    winston.error(`Error in creating a task: ${error.message}`);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get a list of the user's tasks
taskRouter.get("/mytasks", verifyToken, async (req, res) => {
  const isTaskDeleted = req.query.deleted === true;
  const userId = req.user.id; //this is to extract the user ID from the token
  const { page = 1, perPage = 20, state } = req.query;

  const query = { author: userId };
  if (state) query.state = state;
  try {
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage),
      Task.countDocuments(query), //This is to count the total number of tasks
    ]);

    res.render("alltasks", { tasks: tasks, isTaskDeleted });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tasks", error: error.message });
  }
});
// Route to view a single task
taskRouter.get("/view/:taskId", verifyToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send("Task not found");
    }

    res.render("singletaskView", { task: task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).send("Error fetching task");
  }
});

// Complete a task
taskRouter.put("/complete/:id", verifyToken, async (req, res) => {
  const TaskId = req.params.id;
  const author = req.user.id;
  console.log(author);

  try {
    const task = await Task.findById(TaskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    console.log(task.author);
    if (task.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access Denied" });
    }

    if (task.state === "completed") {
      return res.status(400).json({ error: "Task is already completed" });
    }

    task.state = "completed";
    await task.save();

    // Log the publication of the task
    winston.info(`Task completed by ${author}: ${task.name}`);

    res.json(task);
  } catch (error) {
    winston.error(`Error in completing a task: ${error.message}`);
    res.status(500).json({ error: "Server error" });
  }
});

// Edit a task
taskRouter.put("/updateTask/:id", verifyToken, async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "task not found" });
    }

    console.log(task.author);

    if (task.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only edit your own tasks" });
    }

    const { name, description, state } = req.body;

    if (name) task.name = name;
    if (description) task.description = description;
    if (state) task.state = state;

    await task.save();

    // Log the update of the task
    winston.info(`Task edited by ${req.user.id}: ${task.name}`);

    res.json(task);
  } catch (error) {
    winston.error(`Error in editing a task: ${error.message}`);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a task
taskRouter.delete("/deleteTask/:id", verifyToken, async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not the author of this task" });
    }

    await task.deleteOne();

    // Log the deletion of the task
    winston.info(`Task deleted by ${req.user.id}: ${task.name}`);

    res.json({ msg: "Task Successfully deleted" });
  } catch (error) {
    winston.error(`Error in deleting a task: ${error.message}`);
    res.status(500).json({ error: "Server error" });
  }
});

taskRouter.post("/delete/:taskId", verifyToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    // Delete the task from the database
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).send("Task not found");
    }

    // Redirect back to the dashboard or another suitable page
    res.redirect("/task/mytasks?deleted=true");
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send("Error deleting task");
  }
});

// Add this route to task.js
taskRouter.post("/update/:taskId", verifyToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const newTaskState = req.body.state;

    // Update the task's state in the database
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { state: newTaskState },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).send("Task not found");
    }

    // Redirect back to the task details page
    res.redirect(`/task/mytasks`);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Error updating task");
  }
});

// Define a route for viewing pending tasks
taskRouter.get("/tasks/pending", (req, res) => {
  // Add logic to retrieve and render pending tasks
  res.render("pending-tasks", { tasks: pendingTasks });
});

module.exports = taskRouter;
