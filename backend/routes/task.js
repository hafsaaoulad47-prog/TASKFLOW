const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Task = require("../models/Task");
const Project = require("../models/Project");
// Un membre peut uniquement modifier le statut
// des tâches qui lui sont assigné
router.patch("/:id/status", auth, async (req, res) => {
  const { status } = req.body;

  // Vérifier que le statut est valide
  const validStatuses = ["à faire", "en cours", "terminé"];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: "Statut invalide" });

  try {
    const task = await Task.findById(req.params.id);
    if (!task)
      return res.status(404).json({ message: "Tâche introuvable" });

    // Récupérer le projet pour vérifier le rôle
    const project = await Project.findById(task.project);
    if (!project)
      return res.status(404).json({ message: "Projet introuvable" });

    // Vérifier si l'utilisateur est le créateur
    const isOwner = project.owner.toString() === req.user._id.toString();

    // Vérifier si la tâche est assignée à l'utilisateur
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();

    // F8 — seul le créateur ou le membre assigné peut changer le statut
    if (!isOwner && !isAssigned)
      return res.status(403).json({
        message: "Accès refusé — vous ne pouvez modifier que les tâches qui vous sont assignées",
      });

    // Mettre à jour le statut
    task.status = status;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;