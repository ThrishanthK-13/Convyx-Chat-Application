const Message = require("../models/Message");
const User = require("../models/User");

const onlineUsers = new Map(); // userId -> socketId

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 New socket connected:", socket.id);

    /* =========================
       USER COMES ONLINE
    ========================= */
    socket.on("addUser", async (userId) => {
      onlineUsers.set(userId, socket.id);

      await User.findByIdAndUpdate(userId, { online: true });

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    
socket.on("sendMessage", async (data) => {
  try {
    const { senderId, receiverId, message, media, replyTo } = data;

const newMessage = await Message.create({
  senderId,
  receiverId,
  message: message || "",
  media: media
    ? { url: media.url, type: media.type }
    : undefined,

  // ✅ THIS IS THE MISSING PIECE
  replyTo: replyTo
    ? {
        _id: replyTo._id,
        message: replyTo.message || "",
        senderId: replyTo.senderId,
        media: replyTo.media || ""
      }
    : null,

  status: "sent"
});

    // 🔁 SEND BACK TO SENDER
    socket.emit("messageSent", newMessage);

    // 🔁 SEND TO RECEIVER
    if (onlineUsers.has(receiverId)) {
      io.to(onlineUsers.get(receiverId)).emit(
        "receiveMessage",
        newMessage
      );

      await Message.findByIdAndUpdate(newMessage._id, {
        status: "delivered"
      });

      io.to(onlineUsers.get(senderId)).emit("messageDelivered", {
        messageId: newMessage._id
      });
    }

  } catch (err) {
    console.error("❌ Send message error:", err);
  }
});

    /* =========================
       MARK MESSAGES AS SEEN (✔✔🔵)
    ========================= */
    socket.on("markMessagesSeen", async ({ senderId, receiverId }) => {
      try {
        await Message.updateMany(
          {
            senderId,
            receiverId,
            status: { $ne: "seen" }
          },
          { status: "seen" }
        );

        // 🔁 INFORM SENDER
        if (onlineUsers.has(senderId)) {
          io.to(onlineUsers.get(senderId)).emit("messagesSeen", {
            from: receiverId
          });
        }

      } catch (err) {
        console.error("❌ Seen update error:", err);
      }
    });

    /* =========================
   REACT TO MESSAGE (WHATSAPP STYLE ✅)
========================= */
socket.on("reactMessage", async ({ messageId, emoji, userId }) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) return;

    // 🔍 Check if same user already reacted with same emoji
    const existingIndex = message.reactions.findIndex(
      (r) =>
        r.userId.toString() === userId &&
        r.emoji === emoji
    );

    if (existingIndex !== -1) {
      // ❌ REMOVE reaction (toggle off)
      message.reactions.splice(existingIndex, 1);
    } else {
      // ✅ REMOVE other reactions by same user (WhatsApp rule)
      message.reactions = message.reactions.filter(
        (r) => r.userId.toString() !== userId
      );

      // ✅ ADD new reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // 🔁 Broadcast updated reactions
    io.emit("messageReacted", {
      messageId,
      reactions: message.reactions
    });

  } catch (err) {
    console.error("❌ Reaction error:", err);
  }
});
    /* =========================
   DELETE MESSAGE
========================= */
socket.on("deleteMessage", async ({ messageId, userId, type }) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) return;

    if (type === "everyone") {
      message.deletedForEveryone = true;
      message.message = "This message was deleted";
      message.media = null;
      message.reactions = []; // ✅ remove reactions
    }

    if (type === "me") {
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
      }
    }

    await message.save();

    // 🔁 broadcast to BOTH sender & receiver
    io.emit("messageDeleted", {
      messageId,
      type,
      userId
    });

  } catch (err) {
    console.error("❌ Delete message error:", err);
  }
});


    /* =========================
       TYPING INDICATOR
    ========================= */
    socket.on("typing", ({ senderId, receiverId, type = "text" }) => {
      if (onlineUsers.has(receiverId)) {
        io.to(onlineUsers.get(receiverId)).emit("typing", {
          senderId,
          type // "text" | "audio"
        });
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      if (onlineUsers.has(receiverId)) {
        io.to(onlineUsers.get(receiverId)).emit("stopTyping", {
          senderId
        });
      }
    });

    /* =========================
       USER DISCONNECT
    ========================= */
    socket.on("disconnect", async () => {
      console.log("❌ Socket disconnected:", socket.id);

      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);

          await User.findByIdAndUpdate(userId, {
            online: false,
            lastSeen: new Date()
          });

          break;
        }
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};
