import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     SEND OTP
  ========================= */
  const sendOTP = async () => {
    if (!phone) return setError("Enter phone number");

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/send-otp", { phone });

      // ✅ MOVE TO OTP SCREEN
      setStep("otp");
    } catch (err) {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     VERIFY OTP
  ========================= */
  const verifyOTP = async () => {
    if (!otp) return setError("Enter OTP");

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/verify-otp", {
        phone,
        otp
      });

      // ✅ LOGIN SUCCESS
      login(res.data);
    } catch (err) {
      setError("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>Chat App</h1>

        {step === "phone" && (
          <>
            <input
              className="input"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button
              className="primary-btn"
              onClick={sendOTP}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <input
              className="input"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              className="primary-btn"
              onClick={verifyOTP}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
