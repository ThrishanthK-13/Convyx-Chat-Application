const BASE_URL = "http://localhost:5000";

export default function ProfileImageModal({ open, image, onClose }) {
  if (!open) return null;

  const imgSrc = image?.startsWith("http")
    ? image
    : `${BASE_URL}${image}`;

  return (
    <div className="profile-image-modal" onClick={onClose}>
      <span className="close-btn" onClick={onClose}>✕</span>

      <img
        src={imgSrc}
        alt="Profile Full View"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
