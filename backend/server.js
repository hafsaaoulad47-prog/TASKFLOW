const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const dashboardRoutes = require("./routes/dashboard");
const taskRoutes = require("./routes/tasks");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
const PORT = process.env.PORT || 5000;
app.use("/api", dashboardRoutes);
app.use("/api", taskRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
