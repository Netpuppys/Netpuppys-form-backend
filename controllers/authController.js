const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
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
};

exports.login = async (req, res) => {
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
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ name: user.name, email: user.email, token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Validate input
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error changing password" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

exports.logout = (req, res) => {
  res.json({ message: "Signed out successfully" });
};

exports.getUsers = async (req, res) => {
  try {
    const AllUsers = await User.find();
    res.status(200).json(AllUsers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching Users" });
  }
};
