import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import NewChatModal from "./NewChatModal";
import Profile from "./Profile";
import ProfilePreview from "./ProfilePreview";

export default function Sidebar() {
  const {
    users = [],
    setCurrentChat,
    setMessages,
    onlineUsers = []
  } = useContext(ChatContext);

  const { user } = useContext(AuthContext);

  const [showNewChat, setShowNewChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // ✅ IMPORTANT

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);


  /* =========================
     REMOVE LOGGED-IN USER
  ========================= */
  const filteredUsers = users.filter(
    (u) => u._id !== user?._id
  );

  /* =========================
     OPEN CHAT
  ========================= */
  const openChat = async (chatUser) => {
    setCurrentChat(chatUser);

    try {
      const res = await api.get(`/messages/${chatUser._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("❌ Failed to load messages", err);
      setMessages([]);
    }
  };

  /* =========================
     PROFILE VIEW (WHATSAPP STYLE)
  ========================= */
  if (showProfile) {
    return <Profile onClose={() => setShowProfile(false)} />;
  }

  return (
    <div className="sidebar">
      {/* HEADER */}
      <div className="sidebar-header">
        <span>Chats</span>

        {/* ✅ PROFILE ICON */}
        <span
          className="profile-icon"
          title="Profile"
          onClick={() => setShowProfile(true)}
        >
          👤
        </span>
      </div>

      {filteredUsers.length === 0 && (
        <div style={{ padding: 16, color: "#aaa" }}>
          No chats available
        </div>
      )}

      {filteredUsers.map((u) => (
  <div
    key={u._id}
    className="chat-user"
    onClick={() => openChat(u)}
  >
    {/* ✅ WHATSAPP STYLE AVATAR */}
    <div className="wa-avatar">
  <div className="wa-avatar">
  <img
    src={
      u.profilePic
        ? u.profilePic.startsWith("http")
          ? u.profilePic
          : `http://localhost:5000${u.profilePic}`
        : "/default-avatar.png"
    }
    alt="avatar"
    className="wa-avatar-img"
    onClick={(e) => {
      e.stopPropagation(); // 👈 prevents chat open
      setPreviewImage(u.profilePic);
      setPreviewOpen(true);
    }}
  />
</div>

  <span
    className={`dot ${
      onlineUsers.includes(u._id) ? "online" : "offline"
    }`}
  />
  </div>


    <div className="chat-info">
      <div className="name">{u.phone}</div>
    </div>
  </div>
))}

      {/* FLOATING NEW CHAT BUTTON */}
      <button
        className="new-chat-fab"
        onClick={() => setShowNewChat(true)}
        title="New Chat"
      >
        ✉️
      </button>

      {/* NEW CHAT MODAL */}
      <NewChatModal
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        users={filteredUsers}
        onSelect={openChat}
      />

      <ProfilePreview
  open={previewOpen}
  image={previewImage}
  onClose={() => setPreviewOpen(false)}
/>

    </div>
  );
}
