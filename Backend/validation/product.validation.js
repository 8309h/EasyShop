const Joi = require("joi");

const createProductSchema = Joi.object({
  title: Joi.string().required(),
  image: Joi.string().uri().required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  category: Joi.string().valid("men", "women").required(),
});

const updateProductSchema = Joi.object({
  title: Joi.string().optional(),
  image: Joi.string().uri().optional(),
  description: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  category: Joi.string().valid("men", "women").optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};
