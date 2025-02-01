const CarsModel = require("../Schemas/cars.schema");
const mongoose = require("mongoose");
const BaseError = require("../Utils/base_error");
const CategoriesModel = require("../Schemas/category.schema");
const jwt = require("jsonwebtoken");
const LikeModel = require("../Schemas/like.schema")

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

async function getCategories(req, res, next) {
  try {
    const categories = await CategoriesModel.find().lean();
    if (!categories.length) {
      return next(
        BaseError.BadRequest(404, "Hali category'lar mavjud emas...")
      );
    }
    const cars = await CarsModel.aggregate([
      { $sort: { brand: 1 } },
      {
        $group: {
          _id: "$brand",
          firstImage: { $first: { $arrayElemAt: ["$img", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          brand: "$_id",
          firstImage: 1,
        },
      },
    ]);
    categories.forEach((category) => {
      const car = cars.find((car) => car.brand === category.category);
      if (car) {
        category.firstImage = car.firstImage;
      } else {
        category.firstImage = null;
      }
    });
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
}

async function addCategory(req, res, next) {
  try {
    const { category } = req.body;
    const { accesstoken } = req.cookies;
    const decoded = jwt.verify(accesstoken, process.env.ACCESS_SECRET_KEY);
    const existsCategory = await CategoriesModel.findOne({
      category: category,
    });
    if (existsCategory) {
      return next(
        BaseError.BadRequest(403, `${category} category'si avvaldan mavjud!`)
      );
    }
    const addedCategory = await CategoriesModel.create({
      category,
      createdBy: decoded.id,
    });
    res.status(201).json(addedCategory);
  } catch (error) {
    next(error);
  }
}

// Update category

async function updateCategories(req, res, next) {
  try {
    const { category, newCategory } = req.body;
    await CarsModel.updateMany(
      { brand: category },
      { $set: { brand: newCategory } }
    );
    const result = await CategoriesModel.updateOne({category: category})
    if (!result) {
      return next(
        BaseError.BadRequest(
          404,
          `Bunday ${category} category topilmadi...`
        )
      );
    }
    res.status(200).json({
      message: `Barcha ${category} brendidagi avtomobillar ${newCategory} brendiga almashtirildi!`,
    });
  } catch (error) {
    next(error);
  }
}

// Delete category
async function deleteCategory(req, res, next) {
  try {
    const { category } = req.body;
    await CarsModel.deleteMany({ brand: category });
    const result = await CategoriesModel.deleteOne({category: category})
    if (!result) {
      return next(
        BaseError.BadRequest(
          404,
          `Bunday ${category} category topilmadi...`
        )
      );
    }
    res.status(200).json({
      message: `Barcha ${category} avtomobillari o'chirildi!`,
      DeletedCarsAmount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
}

// Get cars by brand
async function getCars(req, res, next) {
  try {
    const { category } = req.query;
    const cars = await CarsModel.find({
      brand: { $regex: category, $options: "i" },
    }).sort({ price: -1 });

    if (!cars.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(cars);
  } catch (error) {
    next(error);
  }
}

// Search cars by model
async function searchCars(req, res, next) {
  try {
    const { model } = req.query;
    const cars = await CarsModel.find({
      model: { $regex: model, $options: "i" },
    });

    if (!cars.length) {
      return next(
        BaseError.BadRequest(
          404,
          "Ushbu qidiruv bo'yicha avtomobillar topilmadi..."
        )
      );
    }

    res.status(200).json(cars);
  } catch (error) {
    next(error);
  }
}

// Get one car by ID
async function getOneCar(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(
        BaseError.BadRequest(400, "ID noto'g'ri formatda kiritilmoqda...")
      );
    }
    const car = await CarsModel.findById(id).lean();
    if (!car) {
      return next(BaseError.BadRequest(404, "Bunday avtomobil mavjud emas..."));
    }
    const [likes] = await Promise.all([
      LikeModel.countDocuments({ carId: id })
    ]);
    car.likes = likes;
    res.status(200).json(car);
  } catch (error) {
    next(error);
  }
}

// Add new car
async function addCar(req, res, next) {
  try {
    const {
      brand,
      model,
      motor,
      color,
      gearbox,
      description,
      tinting,
      year,
      distance,
      price,
    } = req.body;
    const { accesstoken } = req.cookies;
    const decoded = jwt.verify(accesstoken, process.env.ACCESS_SECRET_KEY);
    const car = new CarsModel({
      brand: brand,
      model: model,
      motor: motor,
      color: color,
      gearbox: gearbox,
      description: description,
      tinting: tinting,
      year: year,
      distance: distance,
      price: price,
      createdBy: decoded.id,
    });
    await car.save();
    res
      .status(201)
      .json({ message: "Yangi avtomobil ro'yxatga muvaffaqiyatli qo'shildi!" });
  } catch (error) {
    next(error);
  }
}

// Update car
async function updateCar(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(BaseError.BadRequest(400, "Noto'g'ri ID formati!"));
    }

    const foundCar = await CarsModel.findById(id);
    if (!foundCar) {
      return next(BaseError.BadRequest(404, "Bunday avtomobil topilmadi..."));
    }

    await CarsModel.findByIdAndUpdate(id, req.body);
    res.status(200).json({
      message: `${foundCar.brand} ${foundCar.model} avtomobilining ma'lumotlari muvaffaqiyatli yangilandi!`,
    });
  } catch (error) {
    next(error);
  }
}

// Delete car
async function deleteCar(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(BaseError.BadRequest(400, "Noto'g'ri ID formati!"));
    }

    const foundCar = await CarsModel.findById(id);
    if (!foundCar) {
      return next(BaseError.BadRequest(404, "Bunday avtomobil topilmadi..."));
    }

    await CarsModel.findByIdAndDelete(id);
    res.status(200).json({
      message: `${foundCar.brand} ${foundCar.model} avtomobilining ma'lumotlari muvaffaqiyatli o'chirib tashlandi!`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCars,
  getOneCar,
  searchCars,
  addCar,
  updateCar,
  deleteCar,
  getCategories,
  updateCategories,
  deleteCategory,
  addCategory,
};
