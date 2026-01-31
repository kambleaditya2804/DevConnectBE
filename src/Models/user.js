import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minLength: 3, maxLength: 50 },
    lastName: { type: String, required: true },
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
    age: { type: Number, min: 18 },
    gender: {
      type: String,
      trim: true,
      validate(value) {
        if (!["male", "female", "others", "Male", "Female", "Others"].includes(value)) {
          throw new Error("Not a valid gender (Male, Female, Others)");
        }
      },
    },
    about: { type: String },
    photoURL: {
      type: String,
      default: "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg",
      validate(value) {
        if (!validator.isURL(value)) throw new Error("Invalid URL: " + value);
      },
    },
    skills: { type: [String] },
  },
  { timestamps: true }
);

userSchema.index({ firstName: 1, lastName: 1 });

// generate JWT
userSchema.methods.getjwt = async function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  return token;
};

// hash password
userSchema.methods.encryptPassword = async function (passwordInputByUser) {
  return await bcrypt.hash(passwordInputByUser, 10);
};

// validate password
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  return await bcrypt.compare(passwordInputByUser, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
