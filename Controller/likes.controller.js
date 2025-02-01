const BaseError = require("../Utils/base_error")
const LikeModel= require("../Schemas/like.schema")
const jwt = require("jsonwebtoken")

const likeCar = async (req, res, next) => {
    try {
      const { refreshtoken } = req.cookies;
      if (!refreshtoken) {
        return next(BaseError.BadRequest(404, "Refresh token topilmadi!"));
      }
      const decoded = jwt.verify(refreshtoken, process.env.REFRESH_SECRET_KEY)
      const userId = decoded.id
      const {carId} = req.body
      const existingLike = await LikeModel.findOne({ userId: userId, carId });
      if (existingLike) {
        return next(BaseError.BadRequest(403, "Siz bu avtomobilga like bosgansiz!"))
      }
      const like = new LikeModel({ userId: userId, carId });
      await like.save();
      res.status(200).json({
          message: "Avtomobilga like bosildi!"
      })
    } catch (error) {
      next(error)
    }
  };
  
  const unLikeCar = async (req, res, next) => {
    try {
      const { refreshtoken } = req.cookies;
      if (!refreshtoken) {
        return next(BaseError.BadRequest(404, "Refresh token topilmadi!"));
      }
      const decoded = jwt.verify(refreshtoken, process.env.REFRESH_SECRET_KEY)
      const userId = decoded.id
        const { carId } = req.body;
        const existingLike = await LikeModel.findOne({ userId: userId, carId });
        console.log("Existing Like:", existingLike);
        if (!existingLike) {
            return next(BaseError.BadRequest(403, "Siz bu avtomobilga like bosmagansiz!"));
        }
        const result = await LikeModel.deleteOne({ userId: userId, carId });
        if (result.deletedCount === 0) {
            return next(BaseError.BadRequest(500, "Like o'chirilmadi, iltimos keyinroq urinib ko'ring!"));
        }
        return res.status(200).json({
            message: "Avtomobilga unlike bosildi!"
        });
    } catch (error) {
        console.log("Xato yuz berdi:", error);
        next(error);
    }
};


  
  module.exports = {
    likeCar,
    unLikeCar
  }