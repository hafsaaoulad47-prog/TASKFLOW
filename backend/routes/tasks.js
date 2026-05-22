const express = require("express");
const router = express.Router();

const Task = require("../models/Task");

router.get("/tasks", async (req, res) => {

  try {

     const {
       status,
       priority,
       assignedTo,
       search,
       page = 1,
       limit = 2
     } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (search) {

      filter.$or = [

        {
          title: {
            $regex: search,
            $options: "i"
          }
        },

        {
          description: {
            $regex: search,
            $options: "i"
          }
        }

      ];
    }

   const total = await Task.countDocuments(filter);

   const tasks = await Task.find(filter)
     .skip((page - 1) * limit)
     .limit(Number(limit));
  res.json({
     data: tasks,
     total,
     page: Number(page),
     totalPages: Math.ceil(total / limit)
  });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;