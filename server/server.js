require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

/* =========================
   DEBUG: SERVER ROOT
========================= */
console.log("🧠 SERVER CWD:", process.cwd());

/* =========================
   SOCKET.IO INITIALIZATION
========================= */
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* =========================
   DATABASE CONNECTION
========================= */
connectDB();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* =========================
   STATIC FILES (MEDIA)
========================= */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* =========================
   ROUTES
========================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

/* =========================
   SOCKET HANDLERS
========================= */
require("./socket/socket")(io);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Chat server is running 🚀");
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
