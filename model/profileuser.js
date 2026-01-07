const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  bio: String,

  profileImage: String,

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  skills: [{
   name:String
  }],

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

  // Template selection
  template: { type: String, default: 'modern', enum: ['modern', 'classic', 'creative', 'minimal'] },

  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  // Only hash if password is modified or new
  if (!this.isModified("password")) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// Prevent password from being returned in queries
userSchema.pre("findOneAndUpdate", function(next) {
  // Prevent password updates through findOneAndUpdate
  if (this.getUpdate().$set && this.getUpdate().$set.password) {
    delete this.getUpdate().$set.password;
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    console.error("Password comparison error:", err);
    return false;
  }
};

module.exports = mongoose.model("ProfileUser", userSchema);
