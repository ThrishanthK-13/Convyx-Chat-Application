import { useEffect, useState } from "react";
import api from "../api/axios";

const BASE_URL = "http://localhost:5000";

export default function OpponentProfile({ userId, onClose }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load opponent profile", err);
      }
    };

    fetchProfile();
  }, [userId]);

  if (!profile) return null;

  return (
    <div className="opponent-profile-overlay">
      <div className="profile-header">
        <span onClick={onClose}>←</span>
        <h3>Contact info</h3>
      </div>

      <div className="profile-avatar-large">
        <img
          src={
            profile.profilePic
              ? `${BASE_URL}${profile.profilePic}`
              : "/default-avatar.png"
          }
          alt="profile"
        />
      </div>

      <div className="profile-field">
        <label>Phone</label>
        <div>{profile.phone}</div>
      </div>

      <div className="profile-field">
        <label>About</label>
        <div className="about-text">
          {profile.about || "Hey there! I am using ChatApp"}
        </div>
      </div>
    </div>
  );
}
