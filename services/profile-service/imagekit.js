const ImageKit = require("imagekit");
const multer = require("multer");

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ""
});

// Multer memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed!"), false);
    }
  }
});

// Upload function
const uploadToImageKit = async (file, folder = "portfolio") => {
  try {
    const result = await imagekit.upload({
      file: file.buffer,
      fileName: `${Date.now()}_${file.originalname}`,
      folder: folder,
      useUniqueFileName: true,
      tags: ["portfolio", "profile"]
    });
    return result;
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw error;
  }
};

module.exports = {
  imagekit,
  storage,
  upload,
  uploadToImageKit
};
