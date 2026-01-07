const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const Profile = require("./models/Profile");

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoUrl = process.env.MONGO_URL || "mongodb://mongo:27017/portfolioDB";
mongoose
  .connect(mongoUrl)
  .then(() => console.log("✅ Profile Service: Connected to MongoDB"))
  .catch((err) => console.error("❌ Profile Service MongoDB error:", err));

// Auth Service URL
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth-service:3001";

// Middleware to verify JWT from auth service
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token with auth service
    const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/verify`, {}, {
      headers: { Authorization: token }
    });

    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({ error: "Invalid token" });
    }
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "profile-service" });
});

// Get profile by user ID
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({ profile });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Get own profile (authenticated)
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({ profile });
  } catch (err) {
    console.error("Get own profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Create or update profile
app.post("/api/profile", verifyToken, async (req, res) => {
  try {
    const {
      bio, profileImage, phone, github, linkedin,
      degree, branch, university, cgpa, year,
      skills, projects, education10, education12
    } = req.body;

    let profile = await Profile.findOne({ userId: req.user.id });

    if (profile) {
      // Update existing profile
      profile.bio = bio;
      if (profileImage) profile.profileImage = profileImage;
      profile.phone = phone;
      profile.github = github;
      profile.linkedin = linkedin;
      profile.degree = degree;
      profile.branch = branch;
      profile.university = university;
      profile.cgpa = cgpa;
      profile.year = year;
      profile.skills = skills || [];
      profile.projects = projects || [];
      profile.education10 = education10 || [];
      profile.education12 = education12 || [];
      profile.updatedAt = Date.now();

      await profile.save();
      console.log("✅ Profile updated for user:", req.user.id);
    } else {
      // Create new profile
      profile = new Profile({
        userId: req.user.id,
        bio,
        profileImage,
        phone,
        github,
        linkedin,
        degree,
        branch,
        university,
        cgpa,
        year,
        skills: skills || [],
        projects: projects || [],
        education10: education10 || [],
        education12: education12 || []
      });

      await profile.save();
      console.log("✅ Profile created for user:", req.user.id);
    }

    res.json({
      message: "Profile saved successfully",
      profile
    });
  } catch (err) {
    console.error("Save profile error:", err);
    res.status(500).json({ error: "Failed to save profile", details: err.message });
  }
});

// Delete profile
app.delete("/api/profile", verifyToken, async (req, res) => {
  try {
    await Profile.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Delete profile error:", err);
    res.status(500).json({ error: "Failed to delete profile" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Profile Service running on port ${PORT}`);
});
