import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import socket from "../socket";

export default function ForwardModal({ open, onClose, message, users }) {
  const { user } = useContext(AuthContext);

  if (!open) return null;

  const handleForward = (receiverId) => {
    if (!receiverId || !user?._id) return;

    console.log("📤 Forwarding message to:", receiverId);

    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      message: message.message || "",
      media: message.media || null
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Forward to</h3>

        {Array.isArray(users) && users.length > 0 ? (
          users.map((u) => (
            <div
              key={u._id}
              className="user-item"
              onClick={() => handleForward(u._id)}
            >
              {u.phone}
            </div>
          ))
        ) : (
          <p>No contacts available</p>
        )}

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
