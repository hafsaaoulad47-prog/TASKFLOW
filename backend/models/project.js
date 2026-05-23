const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    // Titre du projet
    title: { type: String, required: true, trim: true },
    // Description optionnelle
    description: { type: String, default: "" },
    // Date limite optionnelle
    deadline: { type: Date },
    // Statut du projet parmi trois valeurs possibles
    status: {
      type: String,
      enum: ["actif", "en pause", "archivé"],
      default: "actif",
    },
    // Référence vers le créateur du projet
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Liste des membres invités
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Suppression en cascade des tâches et activités lors de la suppression du projet
projectSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  await mongoose.model("Task").deleteMany({ project: this._id });
  await mongoose.model("Activity").deleteMany({ project: this._id });
  next();
});

module.exports = mongoose.model("Project", projectSchema);