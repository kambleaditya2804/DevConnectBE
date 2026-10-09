// import jwt from "jsonwebtoken";
// import User from "../Models/user.js";

// const userAuth = async (req, res, next) => {
//   try {
//     const { token } = req.cookies;
//     if (!token) {
//       return res.status(401).json({ message: "Please login or signup" });
//     }
//     const decodedObj = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decodedObj._id);
//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }
//     req.user = user;
//     next();
//   } catch (err) {
//     // ✅ proper status codes per error type
//     if (err.name === "TokenExpiredError")
//       return res.status(401).json({ message: "Session expired, please login again" });
//     if (err.name === "JsonWebTokenError")
//       return res.status(401).json({ message: "Invalid token" });
//     res.status(401).json({ message: err.message });
//   }
// };

// export default userAuth;

import express from "express";
import validator from "validator";
import bcrypt from "bcryptjs";

import User from "../Models/user.js";
import { validateSignupData } from "../utils/validation.js";

const authRouter = express.Router();

// Cross-site cookies (frontend and backend on different onrender.com subdomains)
// need sameSite "none" + secure. Locally (http://localhost) keep the defaults.
const isHttpsDeploy = (process.env.FRONTEND_URL || "").startsWith("https");
const cookieOptions = isHttpsDeploy
  ? { httpOnly: true, secure: true, sameSite: "none" }
  : { httpOnly: true };

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

    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000), ...cookieOptions });
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
    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000), ...cookieOptions });
    res.status(200).json({ user });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// logout
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()), ...cookieOptions }).send("User Logged out successfully");
});

export default authRouter;