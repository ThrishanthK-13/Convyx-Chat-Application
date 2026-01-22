import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUsers = async () => {
      const res = await api.get("/users");
      setUsers(res.data);
    };

    fetchUsers();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        users,
        currentChat,
        setCurrentChat,
        messages,
        setMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
