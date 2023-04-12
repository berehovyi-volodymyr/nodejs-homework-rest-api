const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { error } = require("console");

const contactSchema = new Schema({
  name: {
    type: String,
    required: [true, "name must be exist"],
  },
  email: {
    type: String,
    required: [true, "email must be exist"],
  },
  phone: {
    type: String,
    required: [true, "email must be exist"],
  },
  favorite: {
    type: Boolean,
    default: false,
  },
});

contactSchema.post("save", (error, data, next) => {
  error.status = 400;
  next();
});

const addSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": `"name" is required`,
    "string.empty": `"name" cannot be empty`,
  }),
  email: Joi.string().required().messages({
    "any.required": `"email" is required`,
    "string.empty": `"email" cannot be empty`,
  }),

  phone: Joi.string().required().messages({
    "any.required": `"phone" is required`,
    "string.empty": `"phone" cannot be empty`,
  }),

  favorite: Joi.boolean(),
});

const updateFavoriteStatus = Joi.object({
  favorite: Joi.boolean().required().messages({
    "any.required": `"favorite" is required`,
  }),
});

const schemas = {
  addSchema,
  updateFavoriteStatus,
};

const Contact = model("contact", contactSchema);

module.exports = { Contact, schemas };
