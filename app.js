import "./src/Config/env.js"; // MUST be first
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
import initalizeSocket from "./src/utils/socket.js";
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    withCredentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);

// DB → Server
const server = http.createServer(app);
initalizeSocket(server);
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => { // app → server modified
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });

  