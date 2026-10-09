import validator from "validator";

export const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Enter a valid first or last name");
  }
  if (!validator.isEmail(emailId)) {
    throw new Error("Enter a valid Email ID");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password");
  }
};

export const validateEditFields = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "photoURL",
    "skills",
    // ✅ emailId removed — changing email needs its own verification flow
  ];
  return Object.keys(req.body).every((field) => allowedEditFields.includes(field));
};
