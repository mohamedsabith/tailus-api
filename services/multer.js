import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const dir = "./public/images";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    callback(null, dir);
  },
  filename(req, file, callback) {
    console.log(file);
    callback(
      null,
      new Date().toISOString().replace(/:/g, "-") + file.originalname
    );
  },
});

const fileFilter = async (req, file, callback) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image.webp"
  ) {
    callback(null, true);
  } else {
    return callback({ message: "This image format is not allowed" }, false);
  }
  return true;
};

const Upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter,
});
export default Upload;
