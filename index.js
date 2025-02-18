const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Form Schema
const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  website: String,
  budget: String,
  service: String,
  startTime: String,
  employeeSize: String,
  designation: String,
  selectedDate: Date,
  selectedTime: String,
  createdAt: Date,
});

const Form = mongoose.model("Form", formSchema);

// Routes
app.post("/submit", async (req, res) => {
  try {
    const newForm = new Form(req.body);
    await newForm.save();
    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error submitting form" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
