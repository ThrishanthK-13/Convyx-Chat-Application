import { useEffect, useState } from "react";
import api from "../api/axios";

const BASE_URL = "http://localhost:5000";

export default function Profile({ onClose }) {
  const [profile, setProfile] = useState(null);
  const [about, setAbout] = useState("");
  const [uploading, setUploading] = useState(false);

  /* =========================
     LOAD MY PROFILE
  ========================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setProfile(res.data);
        setAbout(res.data.about || "");
      } catch (err) {
        console.error("❌ Failed to load profile", err);
      }
    };

    fetchProfile();
  }, []);

  /* =========================
     UPDATE ABOUT / STATUS
  ========================= */
  const updateAbout = async () => {
    if (!about.trim()) return;

    try {
      const res = await api.put("/users/about", { about });
      setProfile(res.data);
    } catch (err) {
      console.error("❌ Failed to update about", err);
    }
  };

  /* =========================
     UPDATE PROFILE PICTURE
  ========================= */
  const updateProfilePic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/users/profile-pic", formData);
      setProfile(res.data);
    } catch (err) {
      console.error("❌ Profile pic upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="profile-screen">
      {/* HEADER */}
      <div className="profile-header">
        <span className="back-btn" onClick={onClose}>←</span>
        <h3>Profile</h3>
      </div>

      {/* PROFILE PICTURE */}
      <div className="profile-avatar">
  <div className="avatar-circle">
    {profile.profilePic ? (
      <img
        src={`${BASE_URL}${profile.profilePic}`}
        alt="profile"
        className="avatar-img"
      />
    ) : (
      <span className="avatar-text">
        {profile.phone.slice(-2)}
      </span>
    )}
  </div>

  <label className="edit-pic">
    📷
    <input
      type="file"
      hidden
      accept="image/*"
      onChange={updateProfilePic}
    />
  </label>
</div>

      {/* PHONE */}
      <div className="profile-field">
        <label>Your phone</label>
        <div>{profile.phone}</div>
      </div>

      {/* ABOUT / STATUS */}
      <div className="profile-field">
        <label>About</label>
        <input
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          onBlur={updateAbout}
          placeholder="Hey there! I am using ChatApp"
        />
      </div>

      {uploading && <div className="uploading">Uploading…</div>}
    </div>
  );
}
