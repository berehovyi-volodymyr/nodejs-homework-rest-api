const { Schema, model } = require("mongoose");
const Joi = require("joi");

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
});

userSchema.post("save", (error, data, next) => {
  error.status = 400;
  next();
});

const registerSchema = Joi.object({
  email: Joi.string().required().messages({
    "any.required": `"email" is required`,
    "string.empty": `"email" cannot be empty`,
  }),

  password: Joi.string().required().messages({
    "any.required": `"password" is required`,
    "string.empty": `"password" cannot be empty`,
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().required().messages({
    "any.required": `"email" is required`,
    "string.empty": `"email" cannot be empty`,
  }),

  password: Joi.string().required().messages({
    "any.required": `"password" is required`,
    "string.empty": `"password" cannot be empty`,
  }),
});

const schemas = {
  registerSchema,
  loginSchema,
};

const User = model("user", userSchema);

module.exports = { User, schemas };
