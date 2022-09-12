import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  folder: "posts",
  allowedFormats: ["jpg", "png"],
  transformation: [
    {
      width: 500,
      height: 500,
      crop: "limit",
    },
  ],
  cloudinary: cloudinary,
});

const parser = multer({ storage: storage });

export default parser;
