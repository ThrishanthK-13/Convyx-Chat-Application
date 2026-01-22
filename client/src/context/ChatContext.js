import { createContext, useEffect, useState } from "react";
import socket from "../socket";
import api from "../api/axios";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [users, setUsers] = useState([]);

  /* =========================
     FETCH USERS
  ========================= */
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await api.get("/users");
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  /* =========================
     ONLINE USERS ONLY
  ========================= */
  useEffect(() => {
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => socket.off("onlineUsers");
  }, []);

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        messages,
        setMessages,
        onlineUsers,
        users
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
