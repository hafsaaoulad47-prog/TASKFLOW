const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware de vérification du token JWT
module.exports = async (req, res, next) => {
  // Vérifier la présence du header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non autorisé — token manquant" });
  }

  // Extraire le token du header
  const token = authHeader.split(" ")[1];

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur sans le mot de passe
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user)
      return res.status(401).json({ message: "Utilisateur introuvable" });

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};