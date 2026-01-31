import express from "express";
import validator from "validator";
import bcrypt from "bcryptjs";

import User from "../Models/user.js";
import { validateSignupData } from "../utils/validation.js";

const authRouter = express.Router();

// signup
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);

    const { firstName, lastName, emailId, password, age, gender, about, skills } = req.body;

    const checkEmail = await User.findOne({ emailId });
    if (checkEmail) throw new Error("Email Already Exist");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({ firstName, lastName, emailId, password: passwordHash, age, gender, about, skills });

    const savedUser = await user.save();
    const token = await savedUser.getjwt();

    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000), httpOnly: true });
    res.status(200).json({ message: "User added successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// login
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) throw new Error("Invalid Email");

    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid Credentials");

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) throw new Error("Invalid Credentials");

    const token = await user.getjwt();
    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000), httpOnly: true });
    res.status(200).json({ user });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// logout
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true }).send("User Logged out successfully");
});

export default authRouter;
