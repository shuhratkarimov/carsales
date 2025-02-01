const CategoryValidation = require("../Validator/categories.validation");

function CategoryValidator(req, res, next) {
  try {
    const { error } = CategoryValidation(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    return next();
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = CategoryValidator