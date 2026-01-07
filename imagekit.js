const ImageKit = require("imagekit");
const multer = require("multer");

// Initialize ImageKit with environment variables
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ""
});

// Configure multer for memory storage (ImageKit needs buffer)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// Function to upload to ImageKit
const uploadToImageKit = async (file, folder = "portfolio") => {
  try {
    const result = await imagekit.upload({
      file: file.buffer, // Required - file buffer
      fileName: `${Date.now()}_${file.originalname}`, // Required - unique filename
      folder: folder, // Optional - organize uploads in folders
      useUniqueFileName: true, // Optional - generate unique names
      tags: ["portfolio", "profile"], // Optional - tags for organization
    });

    console.log("✅ ImageKit upload successful:", result.url);
    return result;
  } catch (error) {
    console.error("❌ ImageKit upload error:", error);
    throw error;
  }
};

// Function to delete from ImageKit
const deleteFromImageKit = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
    console.log("✅ ImageKit file deleted:", fileId);
  } catch (error) {
    console.error("❌ ImageKit delete error:", error);
    throw error;
  }
};

// Export ImageKit instance and helper functions
module.exports = {
  imagekit,
  storage,
  upload,
  uploadToImageKit,
  deleteFromImageKit
};

console.log("ImageKit Loaded:", process.env.IMAGEKIT_PUBLIC_KEY ? "Configured" : "Not Configured");
