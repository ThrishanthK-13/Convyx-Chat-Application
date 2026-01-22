import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  /* =========================
     LOGIN (SAVE TOKEN HERE)
  ========================= */
  const login = (data) => {
    // 🔴 HARD CHECK
    console.log("LOGIN DATA:", data);

    // ✅ SAVE TOKEN
    localStorage.setItem("token", data.token);

    // ✅ SAVE USER
    localStorage.setItem("user", JSON.stringify(data.user));

    // ✅ UPDATE STATE
    setUser(data.user);
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
