const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  bio: String,
  profileImage: String,
  phone: String,
  github: String,
  linkedin: String,
  degree: String,
  branch: String,
  university: String,
  cgpa: String,
  year: String,

  skills: [{
    name: String
  }],

  projects: [{
    title: String,
    description: String,
    link: String
  }],

  education10: [{
    institute: String,
    year: String,
    score: String
  }],

  education12: [{
    institute: String,
    year: String,
    score: String
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Profile", profileSchema);
