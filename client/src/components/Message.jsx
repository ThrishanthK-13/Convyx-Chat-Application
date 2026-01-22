import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import socket from "../socket";
import ForwardModal from "./ForwardModal";

const BASE_URL = "http://localhost:5000";

// ✅ WhatsApp-style emoji list
const REACTION_EMOJIS = [
  "👍", "👎", "❤️", "😂", "🤣", "😍",
  "😮", "😢", "😭", "😡",
  "🔥", "💯", "👏", "🎉", "🤝", "🙏"
];

export default function Message({ m, onReply, chatUsers }) {
  const { user } = useContext(AuthContext);

  // ✅ DEBUG
  console.log("MESSAGE OBJECT:", m);

  // ✅ ownership check
  const isOwn = m.senderId === user._id;

  const [openForward, setOpenForward] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showMoreReactions, setShowMoreReactions] = useState(false);

  /* =========================
     DELETE MESSAGE
  ========================= */
  const handleDelete = (type) => {
    socket.emit("deleteMessage", {
      messageId: m._id,
      userId: user._id,
      type
    });
  };

  /* =========================
     EMOJI REACTION
  ========================= */
  const handleReaction = (emoji) => {
    socket.emit("reactMessage", {
      messageId: m._id,
      emoji,
      userId: user._id
    });
  };

  /* =========================
     MEDIA URL
  ========================= */
  const mediaUrl =
    m.media?.url && m.media.url.startsWith("http")
      ? m.media.url
      : m.media?.url
      ? `${BASE_URL}${m.media.url}`
      : null;

  /* =========================
     DELETE FOR ME → HIDE MESSAGE
  ========================= */
  if (m.deletedFor?.includes(user._id)) {
    return null;
  }

  return (
    <>
      <div
        className={`message-row ${isOwn ? "sent" : "received"}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className={`bubble-wrapper ${isOwn ? "own" : ""}`}>
          
          {/* MESSAGE BUBBLE */}
          <div
            className={`bubble ${isOwn ? "own" : ""} ${
              m.deletedForEveryone ? "deleted" : ""
            }`}
          >
            {/* REPLY PREVIEW */}
            {!m.deletedForEveryone && m.replyTo && (
              <div className="reply-preview whatsapp-reply">
                <div className="reply-bar" />
                <div className="reply-body">
                  <span className="reply-author">
                    {m.replyTo.senderId === user._id ? "You" : "Contact"}
                  </span>
                  <span className="reply-text">
                    {m.replyTo.message
                      ? m.replyTo.message
                      : m.replyTo.media
                      ? "📎 Media"
                      : ""}
                  </span>
                </div>
              </div>
            )}

            {/* MESSAGE CONTENT */}
            {m.deletedForEveryone ? (
              <div className="message-text deleted-text">
                This message was deleted
              </div>
            ) : (
              <>
                {m.message && (
                  <div className="message-text">{m.message}</div>
                )}

                {mediaUrl && m.media?.type?.startsWith("image") && (
                  <img
                    src={mediaUrl}
                    alt="sent-media"
                    className="message-media"
                  />
                )}

                {mediaUrl && m.media?.type?.startsWith("video") && (
                  <video
                    src={mediaUrl}
                    className="message-media"
                    controls
                  />
                )}
                {mediaUrl && m.media?.type?.startsWith("audio") && (
                  <audio controls className="message-audio">
                    <source src={mediaUrl} type={m.media.type} />
                    Your browser does not support audio playback.
                  </audio>
              )}
              </>
            )}

            {/* REACTIONS DISPLAY */}
            {!m.deletedForEveryone && m.reactions?.length > 0 && (
              <div
                className="reaction-bar"
                onClick={(e) => e.stopPropagation()} // ✅ IMPORTANT
              >
                {m.reactions.map((r, i) => (
                  <span
                    key={i}
                    className={`reaction ${
                      r.userId === user._id ? "own-reaction" : ""
                    }`}
                    onClick={() => handleReaction(r.emoji)} // ✅ TOGGLE
                    title="Click to remove reaction"
                  >
                    {r.emoji}
                  </span>
                ))}
              </div>
            )}

            {/* STATUS ✔✔ */}
            {isOwn && !m.deletedForEveryone && (
              <div className="message-meta">
                <span className={`tick ${m.status}`}>
                  {m.status === "sent" && "✔"}
                  {m.status === "delivered" && "✔✔"}
                  {m.status === "seen" && "✔✔"}
                </span>
              </div>
            )}
          </div>

          {/* ACTIONS (ON HOVER) */}
          {showActions && (
            <div className="message-actions">
              
              {/* REPLY */}
              {!m.deletedForEveryone && onReply && (
                <span
                  onClick={() =>
                    onReply({
                      _id: m._id,
                      message: m.message,
                      senderId: m.senderId,
                      media: m.media?.type || ""
                    })
                  }
                  title="Reply"
                >
                  ↩
                </span>
              )}

              {/* FORWARD */}
              {!m.deletedForEveryone && (
                <span onClick={() => setOpenForward(true)} title="Forward">
                  ➡️
                </span>
              )}

              {/* ✅ UPDATED EMOJI REACTIONS */}
              {/* ✅ UPDATED EMOJI REACTIONS */}
              {!m.deletedForEveryone && (
                <div
                  className="reaction-picker"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* FIRST 4 EMOJIS */}
                  {REACTION_EMOJIS.slice(0, 4).map((emoji) => (
                    <span
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                    >
                      {emoji}
                    </span>
                  ))}

                  {/* MORE ICON */}
                  {!showMoreReactions && REACTION_EMOJIS.length > 4 && (
                    <span
                      className="reaction-more"
                      onClick={() => setShowMoreReactions(true)}
                    >
                      ▼
                    </span>
                  )}


                  {/* REMAINING EMOJIS */}
                  {showMoreReactions &&
                    REACTION_EMOJIS.slice(4).map((emoji) => (
                      <span
                        key={emoji}
                        onClick={() => {
                          handleReaction(emoji);
                          setShowMoreReactions(false); // auto close
                        }}
                      >
                        {emoji}
                      </span>
                    ))}
                </div>
              )}

              {/* DELETE FOR ME */}
              <span onClick={() => handleDelete("me")} title="Delete">
                🗑
              </span>

              {/* DELETE FOR EVERYONE */}
              {isOwn && !m.deletedForEveryone && (
                <span onClick={() => handleDelete("everyone")}>❌</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FORWARD MODAL */}
      {!m.deletedForEveryone && (
        <ForwardModal
          open={openForward}
          onClose={() => setOpenForward(false)}
          message={m}
          users={chatUsers}
        />
      )}
    </>
  );
}
