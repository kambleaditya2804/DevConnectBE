import "./src/Config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/Config/database.js";
import authRouter from "./src/routes/auth.js";
import profileRouter from "./src/routes/profile.js";
import requestRouter from "./src/routes/request.js";
import userRouter from "./src/routes/user.js";
import paymentRouter from "./src/routes/payment.js";
import http from "http";
import chatRouter from "./src/routes/chat.js";
import initializeSocket from "./src/utils/socket.js";

const app = express();
 
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// MUST be before express.json() — Razorpay webhook needs raw body
app.use("/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });
