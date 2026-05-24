const Project = require("../models/Project");

// Vérifie que l'utilisateur connecté est le créateur du projet
const isOwner = async (req, res, next) => {
  try {
    // Recherche du projet par son identifiant
    const project = await Project.findById(req.params.id);

    // Si le projet n'existe pas, on retourne une erreur 404
    if (!project)
      return res.status(404).json({ message: "Projet introuvable" });

    // F8 — seules les routes réservées au créateur sont protégées ici
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({
        message: "Accès refusé — réservé au créateur du projet",
      });

    // Attacher le projet à la requête pour éviter une seconde requête
    req.project = project;
    next();
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Vérifie que l'utilisateur est membre ou créateur du projet
const isMember = async (req, res, next) => {
  try {
    // Recherche du projet par son identifiant
    const project = await Project.findById(req.params.id);

    // Si le projet n'existe pas, on retourne une erreur 404
    if (!project)
      return res.status(404).json({ message: "Projet introuvable" });

    // Vérifier si l'utilisateur fait partie du tableau members
    const isMembre = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    // Vérifier si l'utilisateur est le créateur du projet
    const isProjectOwner =
      project.owner.toString() === req.user._id.toString();

    // F8 — un membre invité voit le projet mais ne peut pas le modifier
    if (!isMembre && !isProjectOwner)
      return res.status(403).json({
        message: "Accès refusé — vous n'êtes pas membre de ce projet",
      });

    // Attacher le projet à la requête
    req.project = project;
    next();
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

module.exports = { isOwner, isMember };