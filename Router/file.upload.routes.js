const { Router } = require("express");
const fileUploadRouter = Router();
const uploadImages = require("../Controller/file.upload.controller")
const {verifyAccessToken} = require("../Middlewares/verify_token_middleware")
fileUploadRouter.post("/upload/:carId", verifyAccessToken, uploadImages);
module.exports = fileUploadRouter;
