import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import Message from "./Message";
import socket from "../socket";
import api from "../api/axios";
import OpponentProfile from "./OpponentProfile";

export default function ChatWindow() {
  /* =========================
     CONTEXT
  ========================= */
  const { users, currentChat, messages, setMessages } =
    useContext(ChatContext);
  const { user } = useContext(AuthContext);

  /* =========================
     STATE
  ========================= */
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(false);
  const [uploading, setUploading] = useState(false);

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showOpponentProfile, setShowOpponentProfile] = useState(false);

  // 🎤 AUDIO STATES
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);


  /* =========================
     REGISTER USER ONLINE
  ========================= */
  useEffect(() => {
    if (user?._id) {
      socket.emit("addUser", user._id);
    }
  }, [user?._id]);

  /* =========================
     FORWARD CONTACTS
  ========================= */
  const chatUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter((u) => u._id !== currentChat?._id);
  }, [users, currentChat]);

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     SEND MESSAGE
  ========================= */
  const send = () => {
    if (!text.trim() || !currentChat || !user?._id) return;

    if (replyTo && !replyTo._id) return;

    const replyPayload = replyTo
      ? {
          _id: replyTo._id,
          message: replyTo.message || "",
          senderId: replyTo.senderId,
          media: replyTo.media || ""
        }
      : null;

    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId: currentChat._id,
      message: text.trim(),
      replyTo: replyPayload
    });

    setText("");
    setReplyTo(null);
  };

 // 🎤 START RECORDING (SAFE)
const startRecording = async () => {
  if (!currentChat || !user?._id) return;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorderRef.current = mediaRecorder;
  audioChunksRef.current = [];

  mediaRecorder.ondataavailable = (e) => {
    audioChunksRef.current.push(e.data);
  };

  mediaRecorder.onstop = sendAudioMessage;
  mediaRecorder.start();
  setRecording(true);
};


// 🎤 STOP RECORDING
const stopRecording = () => {
  if (!mediaRecorderRef.current) return;

  mediaRecorderRef.current.stop();
  setRecording(false);
};

// 🎤 SEND AUDIO
const sendAudioMessage = async () => {
  const audioBlob = new Blob(audioChunksRef.current, {
    type: "audio/webm"
  });

  const formData = new FormData();
  formData.append("file", audioBlob);

  const res = await api.post("/messages/upload", formData);

  socket.emit("sendMessage", {
    senderId: user._id,
    receiverId: currentChat._id,
    message: "",
    media: {
      url: res.data.fileUrl,
      type: res.data.fileType
    }
  });
};


  /* =========================
     SEND MEDIA
  ========================= */
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentChat || !user?._id) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/messages/upload", formData);

      socket.emit("sendMessage", {
        senderId: user._id,
        receiverId: currentChat._id,
        message: "",
        media: {
          url: res.data.fileUrl,
          type: res.data.fileType
        }
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
    
  };

  /* =========================
     RECEIVE MESSAGES
  ========================= */
  useEffect(() => {
    if (!currentChat) return;

    const handleMessage = (msg) => {
      const isForCurrentChat =
        (msg.senderId === currentChat?._id &&
          msg.receiverId === user._id) ||
        (msg.senderId === user._id &&
          msg.receiverId === currentChat?._id);

      if (!isForCurrentChat) return;

      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    };

    socket.on("receiveMessage", handleMessage);
    socket.on("messageSent", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
      socket.off("messageSent", handleMessage);
    };
  }, [currentChat, setMessages, user?._id]);

  /* =========================
   TYPING INDICATOR
========================= */
useEffect(() => {
  const handleTyping = ({ senderId }) => {
    if (senderId === currentChat?._id) {
      setTypingUser(true);
    }
  };

  const handleStopTyping = ({ senderId }) => {
    if (senderId === currentChat?._id) {
      setTypingUser(false);
    }
  };

  socket.on("typing", handleTyping);
  socket.on("stopTyping", handleStopTyping);

  return () => {
    socket.off("typing", handleTyping);
    socket.off("stopTyping", handleStopTyping);
  };
}, [currentChat]);

  /* =========================
     DELETE MESSAGE
  ========================= */
  useEffect(() => {
    const handleDelete = ({ messageId, type }) => {
      setMessages((prev) => {
        if (type === "me") {
          return prev.filter((m) => m._id !== messageId);
        }

        if (type === "everyone") {
          return prev.map((m) =>
            m._id === messageId
              ? {
                  ...m,
                  deletedForEveryone: true,
                  message: "This message was deleted",
                  media: null
                }
              : m
          );
        }
        return prev;
      });
    };

    socket.on("messageDeleted", handleDelete);
    return () => socket.off("messageDeleted", handleDelete);
  }, [setMessages]);

  /* =========================
     EMOJI REACTION LISTENER ✅
  ========================= */
  useEffect(() => {
    const handleReaction = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        )
      );
    };

    socket.on("messageReacted", handleReaction);
    return () => socket.off("messageReacted", handleReaction);
  }, [setMessages]);

  /* =========================
     MESSAGE SEEN
  ========================= */
  useEffect(() => {
    if (!currentChat || !user?._id) return;

    socket.emit("markMessagesSeen", {
      senderId: currentChat._id,
      receiverId: user._id
    });

    const handleSeen = ({ from }) => {
      if (from === currentChat._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === currentChat._id
              ? { ...m, status: "seen" }
              : m
          )
        );
      }
    };

    socket.on("messagesSeen", handleSeen);
    return () => socket.off("messagesSeen", handleSeen);
  }, [currentChat, user?._id, setMessages]);


  /* =========================
     INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setText(e.target.value);
    if (!currentChat || !user?._id) return;

    socket.emit("typing", {
      senderId: user._id,
      receiverId: currentChat._id
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: user._id,
        receiverId: currentChat._id
      });
    }, 800);
  };

  if (!currentChat) {
    return <div className="chat-window empty">Select a chat</div>;
  }

  /* =========================
     RENDER
  ========================= */
  return (
  <>
    <div className="chat-window">
      {/* ================= CHAT HEADER ================= */}
      <div className="chat-header">
        <div className="chat-header-left">
          
          {/* 🔵 OPPONENT AVATAR (CLICKABLE) */}
          <div
            className="wa-avatar"
            onClick={() => setShowOpponentProfile(true)}
          >
            {currentChat.profilePic ? (
              <img
                src={`http://localhost:5000${currentChat.profilePic}`}
                alt="profile"
                className="wa-avatar-img"
              />
            ) : (
              <img
                src="/default-avatar.png"
                alt="default"
                className="wa-avatar-img"
              />
            )}
          </div>

          {/* NAME + TYPING */}
          <div className="chat-title-area">
            <div className="chat-title">{currentChat.phone}</div>
            {typingUser && <div className="typing">typing…</div>}
          </div>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="messages">
        {messages.map((m) => (
          <Message
            key={m._id}
            m={m}
            chatUsers={chatUsers}
            onReply={setReplyTo}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ================= REPLY BAR ================= */}
      {replyTo && (
        <div className="reply-bar">
          <div className="reply-content">
            <strong>
              Replying to{" "}
              {replyTo.senderId === user._id ? "You" : currentChat.phone}
            </strong>
            <p>
              {replyTo.message
                ? replyTo.message
                : replyTo.media
                ? "📎 Media"
                : ""}
            </p>
          </div>
          <span className="reply-cancel" onClick={() => setReplyTo(null)}>
            ✕
          </span>
        </div>
      )}

      {/* ================= INPUT BAR ================= */}
      <div className="input-bar">
        <label>
          📎
          <input
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={handleFile}
          />
        </label>

        <input
          placeholder="Type a message…"
          value={text}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />

        <button onClick={send} disabled={uploading}>
          {uploading ? "Uploading…" : "Send"}
        </button>

        <button
  className={`mic-btn ${recording ? "recording" : ""}`}
  onClick={() => {
  recording ? stopRecording() : startRecording();
}}
>
  🎤
</button>

      </div>
    </div>

    {/* ================= OPPONENT PROFILE ================= */}
    {showOpponentProfile && (
  <OpponentProfile
    userId={currentChat._id}
    onClose={() => setShowOpponentProfile(false)}
  />
)}
  </>
);
}
