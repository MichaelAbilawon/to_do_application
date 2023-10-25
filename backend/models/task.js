const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    description: {
      type: String,
    },
    state: {
      type: String,
      enum: [pending, completed, deleted],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("task", taskSchema);