const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Form Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// CREATE USER API (Register)
app.post("/create-user", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

// LOGIN API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ name: user.name, email: user.email, token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

app.post("/logout", (req, res) => {
  res.json({ message: "Signed out successfully" });
});
const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  website: String,
  budget: String,
  service: String,
  startTime: String,
  designation: String,
  description: String,
  createdAt: { type: Date, default: Date.now }, // Ensuring default timestamp
  action: [
    {
      connectionStatus: String,
      connectedVia: String,
      clientStage: String,
      remarks: String,
      nextFollowUp: String,
      createdAt: { type: Date, default: Date.now }, // Add createdAt for each action
      actionBy: String,
    },
  ],
});

const Form = mongoose.model("Form", formSchema);

// Routes
app.post("/submit", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      website,
      budget,
      service,
      startTime,
      designation,
      description,
    } = req.body;

    const newForm = new Form({
      name,
      email,
      phone,
      website,
      budget,
      service,
      startTime,
      designation,
      description,
      createdAt: new Date(),
      action: [], // Empty array initially
    });

    await newForm.save();
    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error submitting form" });
  }
});
app.get("/all-leads", async (req, res) => {
  try {
    const Allleads = await Form.find();
    res.status(200).json(Allleads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching leads" });
  }
});

app.get("/leads", async (req, res) => {
  try {
    const leads = await Form.find();

    const filteredLeads = leads.filter((lead) => {
      if (lead.action.length > 0) {
        const latestAction = lead.action.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        return (
          latestAction.nextFollowUp !== "close" &&
          latestAction.nextFollowUp !== "onboard"
        );
      }
      return true; // If no actions, include in leads
    });

    res.status(200).json(filteredLeads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching leads" });
  }
});

app.get("/notification", async (req, res) => {
  try {
    const leads = await Form.find();
    const today = new Date();

    // Extract year, month, and date from today's date
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const notificationLeads = leads.filter((lead) => {
      if (lead.action.length > 0) {
        const latestAction = lead.action.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        if (latestAction.nextFollowUp) {
          const followUpDate = new Date(latestAction.nextFollowUp);

          // Extract year, month, and date from nextFollowUp
          const followUpYear = followUpDate.getFullYear();
          const followUpMonth = followUpDate.getMonth();
          const followUpDay = followUpDate.getDate();

          // Compare only year, month, and date
          return (
            followUpYear === todayYear &&
            followUpMonth === todayMonth &&
            followUpDay === todayDate
          );
        }
      }
      return false;
    });

    res.status(200).json(notificationLeads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

app.get("/latest-action", async (req, res) => {
  try {
    const leads = await Form.find();

    const latestActionLeads = leads.map((lead) => {
      if (lead.action.length > 0) {
        const latestAction = lead.action.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        return {
          ...lead.toObject(), // Convert Mongoose document to plain object
          action: [latestAction], // Keep only the latest action
        };
      }
      return lead; // Return lead as is if no action exists
    });

    res.status(200).json(latestActionLeads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching latest actions" });
  }
});

app.get("/close", async (req, res) => {
  try {
    const leads = await Form.find();

    const closedLeads = leads.filter((lead) => {
      if (lead.action.length > 0) {
        const latestAction = lead.action.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        return latestAction.nextFollowUp === "close";
      }
      return false;
    });

    res.status(200).json(closedLeads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching closed leads" });
  }
});

app.get("/onboard", async (req, res) => {
  try {
    const leads = await Form.find();

    const onboardLeads = leads.filter((lead) => {
      if (lead.action.length > 0) {
        const latestAction = lead.action.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        return latestAction.nextFollowUp === "onboard";
      }
      return false;
    });

    res.status(200).json(onboardLeads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching onboard leads" });
  }
});

app.get("/missed-leads", async (req, res) => {
  try {
    const leads = await Form.find();
    const today = new Date();

    // Normalize today's date to midnight for accurate comparison
    today.setHours(0, 0, 0, 0);

    const missedLeads = leads.filter((lead) => {
      if (lead.action.length > 0) {
        // Get the latest action
        const latestAction = lead.action.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        if (latestAction.nextFollowUp) {
          const followUpDate = new Date(latestAction.nextFollowUp);

          // Normalize followUpDate to midnight to ignore time
          followUpDate.setHours(0, 0, 0, 0);

          // Check if nextFollowUp is before today
          return followUpDate < today;
        }
      }
      return false;
    });

    res.status(200).json(missedLeads);
  } catch (error) {
    console.error("Error fetching Missed Leads:", error);
    res.status(500).json({ error: "Error fetching Missed Leads" });
  }
});

app.post("/update-action/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      connectionStatus,
      connectedVia,
      clientStage,
      remarks,
      nextFollowUp,
      actionBy,
    } = req.body;

    // Create new action object
    const newAction = {
      connectionStatus,
      connectedVia,
      clientStage,
      remarks,
      nextFollowUp,
      createdAt: new Date(),
      actionBy, // Add timestamp to each action
    };

    // Update the form by adding a new action to the array
    const updatedForm = await Form.findByIdAndUpdate(
      id,
      { $push: { action: newAction } }, // Push new action into action array
      { new: true } // Return the updated document
    );

    if (!updatedForm) {
      return res.status(404).json({ error: "Form not found" });
    }

    res
      .status(200)
      .json({ message: "Action added successfully!", updatedForm });
  } catch (error) {
    res.status(500).json({ error: "Error updating action" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
