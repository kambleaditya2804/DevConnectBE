import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  messages: [messageSchema],
});

chatSchema.index({ participants: 1 });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;

// “There’s a race condition when two users send the first message simultaneously,
//  because find-then-create isn’t atomic. I’d fix it with a unique key for the user pair and an atomic upsert.”
