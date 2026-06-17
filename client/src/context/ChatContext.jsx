import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (error) {
        console.error(
          "Fetch Users Error:",
          error.response?.data || error.message
        );

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    };

    const token = localStorage.getItem("token");

    if (token) {
      fetchUsers();
    } else {
      console.log("No token found");
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        users,
        currentChat,
        setCurrentChat,
        messages,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
