const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      unique: true,
      required: true
    },

    name: String,

    profilePic: {
      type: String,
      default: ""
    },

    about: {
      type: String,
      default: "Hey there! I am using ChatApp"
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    otp: String,
    otpExpires: Date,

    online: {
      type: Boolean,
      default: false
    },

    lastSeen: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
