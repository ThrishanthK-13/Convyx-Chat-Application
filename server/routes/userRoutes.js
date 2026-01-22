const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const { upload } = require("../utils/upload"); // ✅ CORRECT IMPORT

/* =========================
   GET USERS (FOR CHAT LIST)
========================= */
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find(
      {
        _id: { $ne: req.user.id },
        isVerified: true
      },
      "name phone profilePic about online lastSeen"
    ).lean();

    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* =========================
   GET MY PROFILE
========================= */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "phone profilePic about"
    );

    res.json(user);
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/* =========================
   GET OPPONENT PROFILE
========================= */
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "phone profilePic about lastSeen"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Opponent profile error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

/* =========================
   UPDATE PROFILE PICTURE
========================= */
router.post(
  "/profile-pic",
  auth,
  upload.single("file"), // ✅ WORKS NOW
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profilePic: `/uploads/images/${req.file.filename}` },
        { new: true }
      ).select("phone profilePic about");

      res.json(user);
    } catch (err) {
      console.error("Profile pic update error:", err);
      res.status(500).json({ error: "Profile pic update failed" });
    }
  }
);

/* =========================
   UPDATE ABOUT / STATUS
========================= */
router.put("/about", auth, async (req, res) => {
  try {
    const { about } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { about },
      { new: true }
    ).select("phone profilePic about");

    res.json(user);
  } catch (err) {
    console.error("About update error:", err);
    res.status(500).json({ error: "About update failed" });
  }
});

module.exports = router;
