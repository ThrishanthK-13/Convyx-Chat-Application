const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  getMessages,
  sendMessage,
  forwardMessage,
  reactToMessage
} = require("../controllers/messageController");

const { upload, audioUpload } = require("../utils/upload");

/* =========================
   GET CHAT MESSAGES
========================= */
router.get("/:userId", auth, getMessages);

/* =========================
   SEND MESSAGE (TEXT / REPLY)
========================= */
router.post("/send", auth, sendMessage);

/* =========================
   UPLOAD AUDIO MESSAGE 🎤
========================= */
router.post(
  "/upload-audio",
  auth,
  audioUpload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio uploaded" });
      }

      res.json({
        fileUrl: `/uploads/audio/${req.file.filename}`,
        fileType: "audio/webm"
      });
    } catch (err) {
      console.error("❌ Audio upload error:", err);
      res.status(500).json({ error: "Audio upload failed" });
    }
  }
);

/* =========================
   UPLOAD IMAGE / VIDEO
========================= */
router.post(
  "/upload",
  auth,
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let folder = "images";
      if (req.file.mimetype.startsWith("video")) {
        folder = "videos";
      }

      res.json({
        fileUrl: `/uploads/${folder}/${req.file.filename}`,
        fileType: req.file.mimetype
      });
    } catch (err) {
      console.error("❌ Upload failed:", err);
      res.status(500).json({ error: "File upload failed" });
    }
  }
);

/* =========================
   FORWARD MESSAGE
========================= */
router.post("/forward", auth, forwardMessage);

/* =========================
   REACT TO MESSAGE
========================= */
router.put("/:messageId/react", auth, reactToMessage);

module.exports = router;
