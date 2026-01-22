const User = require("../models/User");

/* =========================
   GET ALL USERS (FOR FORWARD)
========================= */
exports.getAllUsers = async (req, res) => {
  try {
    const myId = req.user.id;

    const users = await User.find(
      { _id: { $ne: myId } }, // exclude myself
      "name phone online lastSeen" // only needed fields
    ).sort({ name: 1 });

    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
