const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");

// GET /api/tasks — all tasks with filtering & pagination
router.get("/", auth, async (req, res) => {
  const { project, status, priority, assignedTo, search, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (project) filter.project = project;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  try {
    const total = await Task.countDocuments(filter);
    const data = await Task.find(filter)
      .populate("assignedTo", "fullName email")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ data, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/project/:projectId — tasks of a project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks
router.post("/", auth, async (req, res) => {
  const { title, description, priority, status, deadline, project, assignedTo } = req.body;
  if (!title || !project) return res.status(400).json({ message: "Titre et projet requis" });

  try {
    const task = await Task.create({
      title, description, priority, status, deadline,
      project, assignedTo: assignedTo || null, createdBy: req.user._id,
    });

    await Activity.create({
      type: "task_created",
      description: `${req.user.fullName} a créé la tâche "${title}"`,
      project, user: req.user._id,
    });

    if (assignedTo && assignedTo !== req.user._id.toString()) {
      await Notification.create({
        user: assignedTo,
        message: `Une tâche vous a été assignée : "${title}"`,
        type: "task_assigned",
      });
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "fullName email")
      .populate("createdBy", "fullName");
    if (!task) return res.status(404).json({ message: "Tâche introuvable" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche introuvable" });

    const { title, description, priority, status, deadline, assignedTo } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (deadline !== undefined) task.deadline = deadline;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    await task.save();

    await Activity.create({
      type: "task_updated",
      description: `${req.user.fullName} a modifié la tâche "${task.title}"`,
      project: task.project,
      user: req.user._id,
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/tasks/:id/status
router.patch("/:id/status", auth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["à faire", "en cours", "terminé"];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: "Statut invalide" });

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche introuvable" });

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await Activity.create({
      type: "task_status_changed",
      description: `${req.user.fullName} a changé le statut de "${task.title}" de "${oldStatus}" à "${status}"`,
      project: task.project,
      user: req.user._id,
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tâche introuvable" });

    await Activity.create({
      type: "task_deleted",
      description: `${req.user.fullName} a supprimé la tâche "${task.title}"`,
      project: task.project,
      user: req.user._id,
    });

    await task.deleteOne();
    res.json({ message: "Tâche supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
