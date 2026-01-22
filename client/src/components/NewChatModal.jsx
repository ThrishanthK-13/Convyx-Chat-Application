import { useState } from "react";

export default function NewChatModal({ open, onClose, users, onSelect }) {
  const [search, setSearch] = useState("");

  if (!open) return null;

  const filteredUsers = users.filter((u) =>
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="new-chat-overlay">
      <div className="new-chat-panel">
        {/* HEADER */}
        <div className="new-chat-header">
          <span className="back-btn" onClick={onClose}>←</span>
          <span className="title">Select contact</span>
        </div>

        {/* SEARCH */}
        <input
          className="new-chat-search"
          placeholder="Search contacts"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CONTACT LIST */}
        <div className="new-chat-list">
          {filteredUsers.length === 0 && (
            <div className="empty">No contacts found</div>
          )}

          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="new-chat-user"
              onClick={() => {
                onSelect(u);
                onClose();
              }}
            >
              <div className="avatar">{u.phone?.slice(-2)}</div>
              <div className="name">{u.phone}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
