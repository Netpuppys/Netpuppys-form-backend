require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const formRoutes = require("./routes/formRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));