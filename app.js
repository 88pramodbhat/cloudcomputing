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
const MongoStore = require("connect-mongo");

// Body parser
app.use(express.urlencoded({ extended: true }));

// Public folders
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// -----------------------
// MONGOOSE CONNECTION
// -----------------------
async function main() {
  await mongoose.connect(mongooseURL);
}
main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting:", err));


// -----------------------
// SESSION + FLASH
// -----------------------
app.use(expressSession({
  secret: process.env.SECRET || "mysecret",
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: mongooseURL })
}));

// ⭐ REQUIRED FOR FLASH TO WORK
app.use(flash());


// -------------------- ROUTES -------------------- //

// HOME PAGE
app.get("/", (req, res) => {
  req.flash("success", "Welcome! Please enter the following details.");
  res.render("index.ejs", {
    title: "Portfolio Builder",
    messages: req.flash("success")
  });
});

// PROFILE FORM
app.get("/profile", (req, res) => {
  res.render("profile.ejs");
});


// ------------------------------------------------
// CLOUDINARY TEST ROUTE
// ------------------------------------------------
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) 
    return res.send("No file uploaded!");

  console.log("Cloudinary File URL:", req.file.path);
  res.json(req.file);
  console.log(req.file);
});


// ------------------------------------------------
// REAL PROFILE SUBMISSION (SAVES TO MONGO + CLOUDINARY)
// ------------------------------------------------
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

    // CLOUDINARY IMAGE URL
    profileImage: req.file ? req.file.path : null,

    education10: [{
      institute: edu_institute10,
      year: edu_year10,
      score: edu_score10
    }],
    education12: [{
      institute: edu_institute12,
      year: edu_year12,
      score: edu_score12
    }],

    skills: {
      frontend: frontend ? frontend.split(",") : [],
      backend: backend ? backend.split(",") : [],
      tools: tools ? tools.split(",") : []
    },

    projects: [{
      title: project_title,
      description: project_description,
      link: project_link
    }]
  });

  await user.save();
  console.log(user);
  req.session.user = user;

  res.redirect("/preview");
});

// PREVIEW PAGE
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
  console.log("Server is running on port 8080");
});
