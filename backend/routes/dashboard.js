const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/Task");
const Project = require("../models/Project");

// GET /api/dashboard
router.get("/", auth, async (req, res) => {
  const userId = req.user._id;
  const now = new Date();

  try {
    // Nombre de projets actifs
    const activeProjects = await Project.countDocuments({
      $or: [{ owner: userId }, { members: userId }],
      status: "actif",
    });

    // Agrégation des statistiques des tâches
    const taskStats = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          done: { $sum: { $cond: [{ $eq: ["$status", "terminé"] }, 1, 0] } },
          late: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "terminé"] },
                    { $lt: ["$deadline", now] },
                    { $ne: ["$deadline", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const stats = taskStats[0] || { total: 0, done: 0, late: 0 };

    // Tâches en cours triées par priorité décroissante puis deadline croissante
    const priorityOrder = { haute: 0, moyenne: 1, basse: 2 };
    const inProgressTasks = await Task.find({
      assignedTo: userId,
      status: { $ne: "terminé" },
    })
      .populate("project", "title")
      .sort({ deadline: 1 });

    inProgressTasks.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 1;
      const pb = priorityOrder[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      return (a.deadline || Infinity) - (b.deadline || Infinity);
    });

    res.json({
      activeProjects,
      assignedTasks: stats.total,
      doneTasks: stats.done,
      lateTasks: stats.late,
      inProgressTasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
