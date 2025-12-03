const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  bio: String,

  profileImage: String,

  email: { type: String, required: true, unique: true },

  skills: {
    frontend: [String],
    backend: [String],
    tools: [String]
  },

  projects: [
    {
      title: String,
      description: String,
      link: String
    }
  ],

  education10: [
    {
      institute: String,
      year: String,
      score: String
    }
  ],

  education12: [
    {
      institute: String,
      year: String,
      score: String
    }
  ],

  phone: String,
  github: String,
  linkedin: String,
  degree: String,
  branch: String,
  university: String,
  cgpa: String,
  year: String,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ProfileUser", userSchema);
