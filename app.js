const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ProfileUser = require("./model/profileuser");

const multer = require("multer");
const { storage } = require("./cloudinary");

// ❗ VERY IMPORTANT — use storage: storage
const upload = multer({ storage: storage });

const session = require("express-session");
const flash = require("connect-flash");

require("dotenv").config();

// ----------------- MIDDLEWARE ----------------- //

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: process.env.SECRET || "mysecret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ----------------- MONGODB CONNECTION ----------------- //

mongoose
  .connect(process.env.MONGOURL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Mongo error:", err));

// ----------------- ROUTES ----------------- //

app.get("/", (req, res) => {
  res.redirect("/profile");
});

// Show profile form
app.get("/profile", (req, res) => {
  res.render("profile");
});

// ----------------- PROFILE POST ROUTE ----------------- //

app.post("/profile", upload.single("profileImage"), async (req, res) => {
  try {
    console.log("==== PROFILE ROUTE HIT ====");
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);

    // Duplicate check
    const exists = await ProfileUser.findOne({ email: req.body.email });
    if (exists) {
      req.flash("error", "Email already exists!");
      return res.redirect("/profile");
    }

    // FIX → Cloudinary gives `req.file.path` as URL
    const imageUrl = req.file?.path || null;

    const user = new ProfileUser({
      fullname: req.body.fullname,
      bio: req.body.bio,
      email: req.body.email,
      phone: req.body.phone,
      github: req.body.github,
      linkedin: req.body.linkedin,
      degree: req.body.degree,
      branch: req.body.branch,
      university: req.body.university,
      year: req.body.year,
      cgpa: req.body.cgpa,
      profileImage: imageUrl,
      education10: [
        {
          institute: req.body.edu_institute10,
          year: req.body.edu_year10,
          score: req.body.edu_score10,
        },
      ],
      education12: [
        {
          institute: req.body.edu_institute12,
          year: req.body.edu_year12,
          score: req.body.edu_score12,
        },
      ],
      skills: {
        frontend: req.body.frontend
          ? req.body.frontend.split(",")
          : [],
        backend: req.body.backend
          ? req.body.backend.split(",")
          : [],
        tools: req.body.tools ? req.body.tools.split(",") : [],
      },
      projects: [
        {
          title: req.body.project_title,
          description: req.body.project_description,
          link: req.body.project_link,
        },
      ],
    });

    await user.save();
    req.session.user = user;

    req.flash("success", "Profile uploaded successfully!");
    res.redirect("/preview");

  } catch (err) {
    console.error("Error:", err);
    req.flash("error", "Upload failed.");
    return res.redirect("/profile");
  }
});

// Preview Page
app.get("/preview", (req, res) => {
  const user = req.session.user;
  if (!user) {
    req.flash("error", "Please fill the profile first.");
    return res.redirect("/profile");
  }
  res.render("preview", { user });
});

// ----------------- SERVER ----------------- //

app.listen(8080, () => console.log("Server running on port 8080"));
