import express from "express";

import userAuth from "../Middlewares/auth.js";
import { validateEditFields } from "../utils/validation.js";

const profileRouter = express.Router();

// view profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  res.send(req.user);
});

// edit profile
profileRouter.post("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditFields(req)) throw new Error("Invalid Edit request");

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    await loggedInUser.save();

    res.json({ message: `${loggedInUser.firstName}, your profile updated successfully`, data: loggedInUser });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

export default profileRouter;
