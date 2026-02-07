import crypto from "crypto";
import { Server } from "socket.io";
import Chat from "../Models/chat.js"; // Ensure .js extension if using ES Modules
import userAuth from "../Middlewares/auth.js";
import ConnectionRequestModel from "../Models/connectionRequest.js";
const getRoomId = ({ userId, targetUserId }) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getRoomId({ userId, targetUserId });
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {
      try {
        const roomId = getRoomId({ userId, targetUserId });

//check that they are connections before sending the messages

const isfriend= ConnectionRequestModel.findOne({
$or:[
  {
    fromUserId:userId,
    toUserId:targetUserId,
    status:"accepted"
  },
   {
    fromUserId:targetUserId,
    toUserId:userId,
    status:"accepted"
  }
]
})

        // 1. Database Update
        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] }
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({ 
            senderId: userId, 
            text 
        });
        
        await chat.save();

        // 2. Real-time Broadcast
        // Always emit AFTER saving to DB or use a background promise
        io.to(roomId).emit("messageReceived", { firstName, lastName, text });

      } catch (err) {
        console.error("Error saving message to database:", err);
        // Optional: emit an error event back to the sender
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export default initializeSocket;