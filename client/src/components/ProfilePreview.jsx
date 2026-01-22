const BASE_URL = "http://localhost:5000";

export default function ProfilePreview({ open, image, onClose }) {
  if (!open) return null;

  return (
    <div className="profile-preview-overlay" onClick={onClose}>
      <span className="profile-preview-close">✕</span>

      <img
        src={
          image
            ? image.startsWith("http")
              ? image
              : `${BASE_URL}${image}`
            : "/default-avatar.png"
        }
        alt="profile"
        className="profile-preview-img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
