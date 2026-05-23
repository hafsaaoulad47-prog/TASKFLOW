const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { isOwner, isMember } = require("../middlewares/membre");
const Project = require("../models/Project");
const User = require("../models/User");
// F8 — POST /api/projects/:id/members
// Inviter un membre par email — créateur uniquement
router.post("/:id/members", auth, isOwner, async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifier que l'email est fourni
    if (!email)
      return res.status(400).json({ message: "L'email est requis" });

    // Vérifier que l'utilisateur existe dans la base de données
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Aucun compte trouvé avec cet email" });

    // Vérifier que l'utilisateur n'est pas déjà membre
    const isAlreadyMember = req.project.members.some(
      (m) => m.toString() === user._id.toString()
    );
    if (isAlreadyMember)
      return res.status(409).json({ message: "Cet utilisateur est déjà membre" });

    // Vérifier que le créateur ne s'invite pas lui-même
    if (req.project.owner.toString() === user._id.toString())
      return res.status(400).json({ message: "Le créateur est déjà propriétaire" });

    // Ajouter l'utilisateur au tableau members
    req.project.members.push(user._id);
    await req.project.save();

    res.json({
      message: "Membre ajouté avec succès",
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// F8 — DELETE /api/projects/:id/members/:userId
// Retirer un membre — créateur uniquement
router.delete("/:id/members/:userId", auth, isOwner, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est bien membre
    const isMembre = req.project.members.some(
      (m) => m.toString() === req.params.userId
    );
    if (!isMembre)
      return res.status(404).json({ message: "Cet utilisateur n'est pas membre" });

    // Retirer le membre du tableau members
    req.project.members = req.project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await req.project.save();

    res.json({ message: "Membre retiré avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET /api/projects/:id/members
// Liste des membres — membres et créateu
router.get("/:id/members", auth, isMember, async (req, res) => {
  try {
    // Populate pour retourner les infos sans le mot de passe
    const project = await Project.findById(req.params.id)
      .populate("members", "fullName email")
      .populate("owner", "fullName email");

    res.json({ owner: project.owner, members: project.members });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
