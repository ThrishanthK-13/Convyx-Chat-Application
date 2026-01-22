const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =========================
   BASE PATH (ABSOLUTE)
========================= */
const BASE_PATH = path.resolve(__dirname, "..");

/* =========================
   DIRECTORIES
========================= */
const imageDir = path.join(BASE_PATH, "uploads/images");
const videoDir = path.join(BASE_PATH, "uploads/videos");
const audioDir = path.join(BASE_PATH, "uploads/audio");

/* =========================
   ENSURE DIRECTORIES EXIST
========================= */
[imageDir, videoDir, audioDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/* =========================
   IMAGE / VIDEO STORAGE
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("video")) {
      cb(null, videoDir);
    } else {
      cb(null, imageDir);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

/* =========================
   AUDIO STORAGE (FIXED)
========================= */
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname || "");

    // 🎤 REQUIRED FOR MediaRecorder
    if (!ext && file.mimetype === "audio/webm") {
      ext = ".webm";
    }

    cb(null, `${Date.now()}${ext}`);
  }
});

const audioUpload = multer({
  storage: audioStorage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

module.exports = {
  upload,        // images & videos
  audioUpload    // 🎤 voice messages
};
