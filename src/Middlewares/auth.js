import jwt from "jsonwebtoken";
import User from "../Models/user.js";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Please login or signup" });
    }
    const decodedObj = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedObj._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ message: "Session expired, please login again" });
    if (err.name === "JsonWebTokenError")
      return res.status(401).json({ message: "Invalid token" });
    res.status(401).json({ message: err.message });
  }
};

export default userAuth;
