const express = require('express');
const app = express();
const mongoose = require("mongoose");

const path = require('path');
const profileuser = require("./model/profileuser");
require("dotenv").config();

const mongooseURL = process.env.MONGOURL;

const expressSession = require("express-session");
const flash = require("connect-flash");

// CLOUDINARY + MULTER
const multer = require("multer");
const { storage } = require("./cloudinary");   // Cloudinary storage
const upload = multer({ storage });            // Multer now uses cloudinary storage

// Body parser
app.use(express.urlencoded({ extended: true }));

// Public folders
app.use("/uploads", express.static("uploads"));  
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB connection
async function main() {
  await mongoose.connect(mongooseURL);
}
main()
  .then(() => console.log("connected to mongoose"))
  .catch((err) => console.log("error connecting to mongoose:", err));

// Session + Flash
const sessionoptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
};
app.use(expressSession(sessionoptions));
app.use(flash());

// -------------------- ROUTES -------------------- //

app.get("/", (req, res) => {
  req.flash("success", "Welcome! Please enter the following details.");
  res.render("index.ejs", { 
    title: "Portfolio Builder",
    messages: req.flash("success") 
  });
});

// STEP 1 — Profile Form
app.get("/profile", (req, res) => {
  res.render("profile.ejs");
});


// ------------------------
// ✅ CLOUDINARY TEST UPLOAD ROUTE
// (You requested this)
// ------------------------
app.post("/upload", upload.single("image"), (req, res) => {
  console.log("Cloudinary File URL:", req.file.path); // Cloudinary URL
  res.send("Image uploaded successfully to Cloudinary!");
});


// ------------------------
// REAL PROFILE UPLOAD ROUTE (Cloudinary Applied)
// ------------------------
app.post("/profile", upload.single("profileImage"), async (req, res) => {
  const {
    fullname, bio, email, phone, github, linkedin,
    degree, branch, university, year,
    edu_institute10, edu_year10, edu_score10,
    edu_institute12, edu_year12, edu_score12,
    frontend, backend, tools,
    project_title, project_description, project_link, cgpa
  } = req.body;

  const user = new profileuser({
    fullname,
    bio,
    email,
    phone,
    github,
    linkedin,
    degree,
    branch,
    university,
    year,
    cgpa,

    // ✅ Cloudinary URL saved here
    profileImage: req.file ? req.file.path : null,

    education10: [
      {
        institute: edu_institute10,
        year: edu_year10,
        score: edu_score10
      }
    ],
    education12: [
      {
        institute: edu_institute12,
        year: edu_year12,
        score: edu_score12
      }
    ],

    skills: {
      frontend: frontend.split(","),
      backend: backend.split(","),
      tools: tools.split(",")
    },

    projects: [
      {
        title: project_title,
        description: project_description,
        link: project_link
      }
    ]
  });

  await user.save();
  req.session.user = user;
  res.redirect("/preview");
});

// Preview Route
app.get("/preview", (req, res) => {
  const user = req.session.user;
  if (!user) {
    req.flash("error", "No user found. Please fill the profile first.");
    return res.redirect("/profile");
  }
  res.render("preview.ejs", { user });
});

// SERVER
app.listen(8080, () => {
  console.log("server is running on port 8080");
});
