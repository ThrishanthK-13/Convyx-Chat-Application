const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC MESSAGE INFO
    ========================= */
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: {
      type: String,
      default: ""
    },

    /* =========================
       MEDIA (IMAGE / VIDEO)
    ========================= */
    media: {
      url: {
        type: String,
        default: ""
      },
      type: {
        type: String, // image / video
        default: ""
      }
    },


    /* =========================
       MESSAGE STATUS
    ========================= */
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent"
    },

    /* =========================
       REPLY FEATURE
    ========================= */
    replyTo: {
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  message: {
    type: String,
    default: ""
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  media: {
    type: String,
    default: ""
  }
},


    /* =========================
       FORWARD FEATURE ✅ (ADDED)
    ========================= */
    isForwarded: {
      type: Boolean,
      default: false
    },

    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    /* =========================
       EMOJI REACTIONS
    ========================= */
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        emoji: String
      }
    ],

    /* =========================
       DELETE FEATURES
    ========================= */
    deletedFor: {
      type: [mongoose.Schema.Types.ObjectId],
      default: []
    },

    deletedForEveryone: {
      type: Boolean,
      default: false
    },

    /* =========================
       EDIT MESSAGE
    ========================= */
    edited: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

/* =========================
   INDEX (FAST CHAT LOAD)
========================= */
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
