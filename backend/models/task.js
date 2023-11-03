const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    description: {
      type: String,
    },
    state: {
      type: String,
      enum: ["pending", "completed", "deleted"],
      default: "pending",
    },
    priority: { type: String },
    category: { type: String },
    due_date: { type: Date },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("task", taskSchema);
