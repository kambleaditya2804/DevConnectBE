import express from "express";

import userAuth from "../Middlewares/auth.js";
import ConnectionRequestModel from "../Models/connectionRequest.js"; // corrected path
import User from "../Models/user.js";

const requestRouter = express.Router();

// Send connection request
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const fromUserId = user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    // Check if toUser exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    // Status Check
    const allowedStatuses = ["ignored", "intrested"];
    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid status type: " + status);
    }

    // Check existing connection requests
    const existingConnectionRequest = await ConnectionRequestModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnectionRequest) {
      throw new Error("Already sent the connection request before");
    }

    const connectionRequest = new ConnectionRequestModel({ fromUserId, toUserId, status });
    const data = await connectionRequest.save();

    res.status(200).json({
      message: `${user.firstName} is ${status} in ${toUser.firstName}`,
      data,
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Review connection request (accept/reject)
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    // Validate Status
    const allowedStatuses = ["accepted", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid Status or Status not allowed", success: false });
    }

    // Validate the connection request
    const connectionRequest = await ConnectionRequestModel.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "intrested",
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "Request not found", success: false });
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();

    res.status(200).json({ message: `Connection request ${status}`, data, success: true });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

export default requestRouter;
