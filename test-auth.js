// Simple authentication test script
const mongoose = require("mongoose");
const ProfileUser = require("./model/profileuser");

const mongourl = "mongodb://mongo:27017/profileDb";

async function testAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongourl);
    console.log("✅ Connected to MongoDB");

    // Test 1: Create a test user
    console.log("\n--- Test 1: Creating test user ---");
    const testEmail = "test@example.com";
    const testPassword = "test123";

    // Delete existing test user if exists
    await ProfileUser.deleteOne({ email: testEmail });
    console.log("Cleaned up existing test user");

    const testUser = new ProfileUser({
      fullname: "Test User",
      email: testEmail,
      password: testPassword,
      bio: "Test bio",
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

    await testUser.save();
    console.log("✅ Test user created successfully");
    console.log("   Email:", testUser.email);
    console.log("   Password (hashed):", testUser.password);

    // Test 2: Find user by email
    console.log("\n--- Test 2: Finding user by email ---");
    const foundUser = await ProfileUser.findOne({ email: testEmail });
    if (foundUser) {
      console.log("✅ User found");
      console.log("   Name:", foundUser.fullname);
    } else {
      console.log("❌ User not found");
    }

    // Test 3: Test password comparison
    console.log("\n--- Test 3: Testing password comparison ---");
    
    // Test with correct password
    const isCorrect = await foundUser.comparePassword(testPassword);
    console.log("Correct password test:", isCorrect ? "✅ PASSED" : "❌ FAILED");

    // Test with wrong password
    const isWrong = await foundUser.comparePassword("wrongpassword");
    console.log("Wrong password test:", !isWrong ? "✅ PASSED (correctly rejected)" : "❌ FAILED");

    console.log("\n🎉 All tests completed!");
    console.log("\n📝 You can now login with:");
    console.log("   Email:", testEmail);
    console.log("   Password:", testPassword);

    await mongoose.connection.close();
    console.log("\n✅ MongoDB connection closed");
  } catch (err) {
    console.error("❌ Error during testing:", err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testAuth();
