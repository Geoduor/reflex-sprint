const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const requestsRoutes = require("./routes/requests");
const assignmentsRoutes = require("./routes/assignments");
const statusRoutes = require("./routes/status");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "*" }, // tightened for deployment — see .env.example
});

app.set("io", io);

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

app.use("/api/requests", requestsRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

// Central error handler — catches thrown errors from asyncHandler-wrapped controllers
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Reflex backend running on port ${PORT}`));
