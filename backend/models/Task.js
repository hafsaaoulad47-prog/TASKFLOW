const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  priority: {
    type: String,
    enum: ["basse", "moyenne", "haute"],
    default: "moyenne"
  },
  status: {
    type: String,
    enum: ["a_faire", "en_cours", "termine"],
    default: "a_faire"
  },
  dueDate: Date,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  }
});

module.exports = mongoose.model("Task", taskSchema);