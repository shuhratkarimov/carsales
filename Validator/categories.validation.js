const Joi = require("joi");

const CategoryValidation = (data) => {
  try {
    const CategoryValidationSchema = Joi.object({
      category: Joi.string().min(2).max(30).trim().required().messages({
        "string.base": "Avtomobil category'si string ko'rinishida bo'lishi kerak!",
        "string.empty": "Avtomobil category'si bo'sh bo'lmasligi kerak!",
        "any.required": "Avtomobil category'si talab qilinadi va kiritilishi lozim!",
        "string.min":
          "Avtomobil category'si kamida 2ta belgidan iborat bo'lishi lozim!",
        "string.max":
          "Avtomobil category'si ko'pi bilan 30ta belgidan iborat bo'lishi mumkin!",
      })
    });
    return CategoryValidationSchema.validate(data);
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = CategoryValidation;
