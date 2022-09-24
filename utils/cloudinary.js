import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const cloudUpload = cloudinary.v2;

const cloud = {
  uploadToCloud(req, res, next) {
    const { path } = req.file;
    cloudUpload.uploader
      .upload(path, {
        folder: "posts",
        // width: 1080,
        // height: 1080,
        // crop: "pad",
      })
      .then((image) => {
        req.image = image;
        return next();
      });
  },
};

export default cloud;
