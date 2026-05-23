const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.post('/', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/project/:projectId', async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('assignedTo');
    if (updatedTask) {
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: "Tâche non trouvée" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (task) {
      res.json({ message: "Tâche supprimée avec succès" });
    } else {
      res.status(404).json({ message: "Tâche non trouvée" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['à faire', 'en cours', 'terminé'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (updatedTask) {
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: "Tâche non trouvée" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;