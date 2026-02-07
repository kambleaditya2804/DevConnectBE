import express from 'express'; // Use import to stay consistent
import Chat from '../Models/chat.js';
import userAuth from '../Middlewares/auth.js'; // Ensure naming matches your export

const chatRouter = express.Router();

chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    try {
        // Find chat where both users are participants
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] }
        }).populate({
            path: 'messages.senderId',
            select: "firstName lastName"
        });

        // If no chat exists, initialize a new one with the participants
        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: []
            });
            await chat.save();
        }

        res.status(200).json(chat);
    } catch (err) {
        console.error("Chat Fetch Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default chatRouter;