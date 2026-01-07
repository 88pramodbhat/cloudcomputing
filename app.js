const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ProfileUser = require("./model/profileuser");

const multer = require("multer");
const { upload, uploadToImageKit } = require("./imagekit");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
require("dotenv").config();

// ----------------- MONGODB CONNECTION ----------------- //

const mongourl = "mongodb://mongo:27017/profileDb";

mongoose
  .connect(mongourl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Mongo error:", err));

// ----------------- MIDDLEWARE ----------------- //

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded images (Cloudinary not needed but good practice)
app.use('/uploads', express.static("uploads"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ----------------- SESSION CONFIGURATION ----------------- //

app.use(
  session({
    secret: process.env.SECRET || "mysecret-portfolio-builder-2024",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongourl,
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
    },
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.session.userId ? {
    id: req.session.userId,
    name: req.session.userName,
    email: req.session.userEmail
  } : null;
  next();
});

// ----------------- PROMETHEUS METRICS ----------------- //

const client = require("prom-client");
client.collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
    });
  });
  next();
});

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.send(await client.register.metrics());
  } catch (err) {
    res.status(500).send(err);
  }
});

// ----------------- ROUTES ----------------- //

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  req.flash("error", "Please login first to access this page.");
  res.redirect("/login");
};

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

// Login routes
app.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/profile");
  }
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      req.flash("error", "Please provide both email and password.");
      return res.redirect("/login");
    }

    console.log("Login attempt for:", email);

    // Find user by email
    const user = await ProfileUser.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);
    
    if (!isMatch) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    // Set session
    req.session.userId = user._id;
    req.session.userEmail = user.email;
    req.session.userName = user.fullname;

    console.log("Login successful for:", user.fullname);
    
    req.flash("success", `Welcome back, ${user.fullname}!`);
    res.redirect("/profile");
  } catch (err) {
    console.error("Login error:", err);
    req.flash("error", "An error occurred during login: " + err.message);
    res.redirect("/login");
  }
});

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword } = req.body;

    // Validate input
    if (!fullname || !email || !password) {
      req.flash("error", "Please provide all required fields.");
      return res.redirect("/login");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash("error", "Please provide a valid email address.");
      return res.redirect("/login");
    }

    // Validate password length
    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters long.");
      return res.redirect("/login");
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/login");
    }

    console.log("Signup attempt for:", email);

    // Check if user already exists
    const existingUser = await ProfileUser.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      req.flash("error", "Email already registered. Please login.");
      return res.redirect("/login");
    }

    // Create new user with minimal data
    const newUser = new ProfileUser({
      fullname,
      email,
      password,
      bio: "",
      phone: "",
      github: "",
      linkedin: "",
      degree: "",
      branch: "",
      university: "",
      year: "",
      cgpa: "",
      skills: [],
      projects: [],
      education10: [],
      education12: []
    });

    await newUser.save();
    console.log("New user created:", newUser.email);

    // Set session
    req.session.userId = newUser._id;
    req.session.userEmail = newUser.email;
    req.session.userName = newUser.fullname;

    req.flash("success", "Account created successfully! Please complete your profile.");
    res.redirect("/profile");
  } catch (err) {
    console.error("Signup error:", err);
    req.flash("error", "An error occurred during signup: " + err.message);
    res.redirect("/login");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/");
  });
});

// Profile route (protected)
app.get("/profile", isAuthenticated, async (req, res) => {
  try {
    // Get user data if exists
    const user = await ProfileUser.findById(req.session.userId);
    res.render("profile", { user });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.render("profile", { user: null });
  }
});

// ----------------- PROFILE UPDATE ROUTE ----------------- //

app.post("/profile", isAuthenticated, upload.single("profileImage"), async (req, res) => {
  try {
    console.log("==== PROFILE ROUTE HIT ====");
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);

    // Update existing user instead of creating new
    const userId = req.session.userId;

    // Get current user to preserve existing image
    const currentUser = await ProfileUser.findById(userId);
    let imageUrl = currentUser.profileImage || null;

    // Upload new image to ImageKit if provided
    if (req.file) {
      try {
        const uploadResult = await uploadToImageKit(req.file, "portfolio-profiles");
        imageUrl = uploadResult.url;
        console.log("✅ Image uploaded to ImageKit:", imageUrl);
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        req.flash("error", "Image upload failed. Please try again.");
        return res.redirect("/profile");
      }
    }

    // Ensure arrays exist
    const skillsArray = Array.isArray(req.body.skill_name)
      ? req.body.skill_name
      : req.body.skill_name ? [req.body.skill_name] : [];

    const projectTitles = Array.isArray(req.body.project_title)
      ? req.body.project_title
      : [req.body.project_title];

    const projectDescriptions = Array.isArray(req.body.project_description)
      ? req.body.project_description
      : [req.body.project_description];

    const projectLinks = Array.isArray(req.body.project_link)
      ? req.body.project_link
      : [req.body.project_link];

    // Validate phone number format (10 digits only)
    if (req.body.phone && req.body.phone.trim() !== '') {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(req.body.phone.trim())) {
        req.flash("error", "Phone number must be exactly 10 digits.");
        return res.redirect("/profile");
      }
    }

    const updateData = {
      fullname: req.body.fullname,
      bio: req.body.bio,
      phone: req.body.phone ? req.body.phone.trim() : "", // Sanitize phone number
      github: req.body.github,
      linkedin: req.body.linkedin,
      degree: req.body.degree,
      branch: req.body.branch,
      university: req.body.university,
      year: req.body.year,
      cgpa: req.body.cgpa,
      template: req.body.template || 'modern', // Save selected template

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

      skills: skillsArray.map((s) => ({ name: s })),

      projects: projectTitles.map((title, index) => ({
        title,
        description: projectDescriptions[index],
        link: projectLinks[index],
      })),
    };

    // Only update profileImage if a new one was uploaded
    if (imageUrl) {
      updateData.profileImage = imageUrl;
    }

    const user = await ProfileUser.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    req.session.user = user;

    req.flash("success", "Profile updated successfully!");
    res.redirect("/preview");
  } catch (err) {
    console.error("🔥 ACTUAL ERROR:", err.message);
    console.error(err);
    req.flash("error", "Upload failed: " + err.message);
    return res.redirect("/profile");
  }
});

// ----------------- PREVIEW ROUTE ----------------- //

app.get("/preview", isAuthenticated, async (req, res) => {
  try {
    const user = await ProfileUser.findById(req.session.userId);
    if (!user) {
      req.flash("error", "Please complete your profile first.");
      return res.redirect("/profile");
    }
    
    // Render template based on user selection
    const template = user.template || 'modern';
    const templateFile = `templates/${template}`;
    
    res.render(templateFile, { user });
  } catch (err) {
    console.error("Preview error:", err);
    req.flash("error", "Error loading preview.");
    res.redirect("/profile");
  }
});

// ----------------- SERVER ----------------- //

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
