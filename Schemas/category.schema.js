const { valid, required, ref } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    category: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: false
    },
  },
  { versionKey: false,
    timestamps: true
  }
);

const CategoriesModel = mongoose.model("categories", CategorySchema);
module.exports = CategoriesModel;
