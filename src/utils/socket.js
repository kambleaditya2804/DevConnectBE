import crypto from "crypto";
import { Server } from "socket.io";
import Chat from "../Models/chat.js";
import ConnectionRequestModel from "../Models/connectionRequest.js";

const getRoomId = ({ userId, targetUserId }) => { // here we are creating a unique room id for the two users based on their user ids
  //  there can be multiple users in the chat room, but the room id will be unique for the two users
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173", // ✅ env var
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => { //as soon as the page laods, the user will join the chat room with the target user
      const roomId = getRoomId({ userId, targetUserId }); // we are creating a unique room id for the two users based on their user ids there can be multiple users in the chat room, but the room id will be unique for the two users
      //room is different for each pair of users, so that the messages are not mixed up between different pairs of users
      socket.join(roomId);
    });
    //listening to event sendMessage from the client, and we're extracting the firstName, lastName, userId, targetUserId, and text from the data sent by the client
    // now backend need to pass this data to the database, and then send it back to the client (room), so that the client can display the message in the chat window
    socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text }) => {
      try {//extracting the firstName, lastName, userId, targetUserId, and text from the data sent by the client on this event 
        const roomId = getRoomId({ userId, targetUserId });

        // ✅ fixed: added await — was always truthy before
        const isFriend = await ConnectionRequestModel.findOne({
          $or: [
            { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
            { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
          ],
        });

        if (!isFriend) {
          return socket.emit("error", { message: "You are not connected with this user" });
        }

        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({ senderId: userId, text });
        await chat.save();

        io.to(roomId).emit("messageReceived", { firstName, lastName, text });//look we are emitting the message to the room, 
        //so that all the users in the room can receive the message, and we are sending the firstName, lastName, and text of 
        // the message to the client, so that the client can display the message in the chat window
      } catch (err) {
        console.error("Error saving message:", err);
        socket.emit("error", { message: "Message could not be sent" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export default initializeSocket;