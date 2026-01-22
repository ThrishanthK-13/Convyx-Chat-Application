import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css"; // 🔥 THIS WAS MISSING
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <ChatProvider>
      <App />
    </ChatProvider>
  </AuthProvider>
);
