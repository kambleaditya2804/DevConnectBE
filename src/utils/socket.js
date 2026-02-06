
// import crypto from "crypto";
// import {socket} from "socket.io"

// const getRoomId = ({ userId, targetUserId }) => {
//   return crypto
//     .createHash("sha256")
//     .update([userId, targetUserId].sort().join("_"))
//     .digest("hex");
// };

// const initializeSocket = (server) => {
//   const io = socket(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       Credential: true,
//     },
//   });

//   io.on("connection", (socket) => {

//     socket.on("joinChat", ({ userId, targetUserId }) => {
//       const roomId = getRoomId({ userId, targetUserId });
//       socket.join(roomId);

//     });  // when a component renders initially it will emit the joinChat event with the userId and targetUserId, 
//     // then we will create a unique roomId using the getRoomId function and make the socket join that room.

//     socket.on("sendMessage", ({ firstName, userId, targetUserId, text }) => {
//       const roomId = getRoomId({ userId, targetUserId });
//       console.log(firstName+" "+text )
//       io.to(roomId).emit("messageReceived", { firstName, text }); //sending a recieved message to particular room so that reciever and sender both can see the message in their chat window
//     });

//     socket.on("disconnect", () => {

//     })
//   });
// };

// export default initializeSocket;



import crypto from "crypto";
import { Server } from "socket.io"; // Fix 1: Correct import

const getRoomId = ({ userId, targetUserId }) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = new Server(server, { // Fix 2: Use 'new Server'
    cors: {
      origin: "http://localhost:5173",
      credentials: true, // Fix 3: lowercase 'c' and plural 's'
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getRoomId({ userId, targetUserId });
      socket.join(roomId);
    });

    socket.on("sendMessage", ({ firstName, userId, targetUserId, text }) => {
      const roomId = getRoomId({ userId, targetUserId });
      console.log(firstName + " says: " + text);
      io.to(roomId).emit("messageReceived", { firstName, text });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export default initializeSocket;