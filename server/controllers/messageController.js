const Message = require("../models/Message");

/* =========================
   GET CHAT MESSAGES
========================= */
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId }
      ]
    })
      .populate("replyTo", "message senderId media")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
};

/* =========================
   SEND MESSAGE (NORMAL / REPLY)
========================= */
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message, replyTo } = req.body;
    const senderId = req.user.id;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      replyTo: replyTo || null
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

/* =========================
   FORWARD MESSAGE
========================= */
exports.forwardMessage = async (req, res) => {
  try {
    const { originalMessageId, receiverId } = req.body;
    const senderId = req.user.id;

    const original = await Message.findById(originalMessageId);
    if (!original) {
      return res.status(404).json({ error: "Original message not found" });
    }

    const forwardedMessage = await Message.create({
      senderId,
      receiverId,
      message: original.message,
      media: original.media,
      isForwarded: true,
      forwardedFrom: original.senderId
    });

    res.status(201).json(forwardedMessage);
  } catch (err) {
    console.error("Forward message error:", err);
    res.status(500).json({ error: "Failed to forward message" });
  }
};

/* =========================
   ADD / UPDATE / REMOVE REACTION
========================= */
exports.reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const existingReaction = message.reactions.find(
      r => r.userId.toString() === userId
    );

    if (existingReaction) {
      // Same emoji → remove reaction
      if (existingReaction.emoji === emoji) {
        message.reactions = message.reactions.filter(
          r => r.userId.toString() !== userId
        );
      } else {
        // Change emoji
        existingReaction.emoji = emoji;
      }
    } else {
      // New reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();
    res.json(message);
  } catch (err) {
    console.error("Reaction error:", err);
    res.status(500).json({ error: "Failed to react to message" });
  }
};
