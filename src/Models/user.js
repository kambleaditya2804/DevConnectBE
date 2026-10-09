import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minLength: 3, maxLength: 50 },
    lastName:  { type: String, required: true },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Invalid Email: " + value);
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) throw new Error("Enter strong password");
      },
    },
    age:  { type: Number, min: 18 },
    gender: {
      type: String,
      trim: true,
      lowercase: true, // ✅ auto-normalize to lowercase
      enum: {
        values: ["male", "female", "others"], // ✅ single consistent set
        message: "{VALUE} is not a valid gender",
      },
    },
    about:    { type: String },
    photoURL: {
      type: String,
      default: "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg",
      validate(value) {
        if (!validator.isURL(value)) throw new Error("Invalid URL: " + value);
      },
    },
    skills: { type: [String] },
    isPremium:      { type: Boolean, default: false },       // ✅ added
    membershipType: { type: String, enum: ["silver", "gold"] }, // ✅ added
  },
  { timestamps: true }
);

userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.getjwt = async function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

userSchema.methods.encryptPassword = async function (passwordInputByUser) {
  return await bcrypt.hash(passwordInputByUser, 10);
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  return await bcrypt.compare(passwordInputByUser, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;


