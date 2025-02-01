const { Router } = require("express");
const {
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
} = require("../Controller/cars.controller.js");
const CarsValidator = require("../Middlewares/cars_validation_middleware.js");
const CarsRouter = Router();
const {
  verifyAccessToken,
} = require("../Middlewares/verify_token_middleware.js");
const { likeCar, unLikeCar } = require("../Controller/likes.controller.js");

CarsRouter.get("/get_cars", getCars);
CarsRouter.get("/get_one_car/:id", getOneCar);
CarsRouter.get("/search_cars", searchCars);
CarsRouter.post(
  "/add_car",
  [verifyAccessToken, CarsValidator],
  addCar
);
CarsRouter.put("/update_car/:id", verifyAccessToken, updateCar);
CarsRouter.delete("/delete_car/:id", verifyAccessToken, deleteCar);
CarsRouter.post("/like", verifyAccessToken, likeCar);
CarsRouter.post("/unlike", verifyAccessToken, unLikeCar);
CarsRouter.post("/add_category", verifyAccessToken, addCategory)
CarsRouter.get("/get_categories", verifyAccessToken, getCategories);
CarsRouter.put("/update_category", verifyAccessToken, updateCategories);
CarsRouter.delete("/delete_category", verifyAccessToken, deleteCategory);

module.exports = CarsRouter;
