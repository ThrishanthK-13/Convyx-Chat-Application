import { useEffect, useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import socket from "../socket";
import { AuthContext } from "../context/AuthContext";

export default function Chat() {
  const { user } = useContext(AuthContext);

  // 🔹 STEP 6: SEND USER ONLINE STATUS
  useEffect(() => {
    if (user) {
      socket.emit("addUser", user._id);
    }
  }, [user]);

  return (
    <div className="app-container">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
