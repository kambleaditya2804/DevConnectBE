import validator from "validator";

/**
 * Validate signup request data
 * @param {object} req - Express request object
 * @throws {Error} If validation fails
 */
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

/**
 * Validate fields allowed for profile edit
 * @param {object} req - Express request object
 * @returns {boolean} True if all fields are allowed
 */
export const validateEditFields = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "age",
    "gender",
    "about",
    "photoURL",
    "skills",
  ];

  return Object.keys(req.body).every((field) => allowedEditFields.includes(field));
};
