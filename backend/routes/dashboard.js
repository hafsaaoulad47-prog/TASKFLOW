const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");

router.get("/dashboard", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId("000000000000000000000001");
    const now = new Date();

    const activeProjectsResult = await Project.aggregate([
      {
        $match: {
          owner: userId,
          status: "actif"
        }
      },
      {
        $count: "total"
      }
    ]);

    const taskStatsResult = await Task.aggregate([
      {
        $match: {
          assignedTo: userId
        }
      },
      {
        $group: {
          _id: null,
          assignedTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "termine"] }, 1, 0]
            }
          },
          lateTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ["$dueDate", now] },
                    { $ne: ["$status", "termine"] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      activeProjects: activeProjectsResult[0]?.total || 0,
      assignedTasks: taskStatsResult[0]?.assignedTasks || 0,
      completedTasks: taskStatsResult[0]?.completedTasks || 0,
      lateTasks: taskStatsResult[0]?.lateTasks || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;