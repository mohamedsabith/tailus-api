/* eslint-disable import/extensions */
import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  getTimelinePosts,
  likePost,
  reportPost,
} from "../controllers/postController.js";
import cloudUpload from "../utils/cloudinary.js";
import Upload from "../utils/multer.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = express.Router();

router.post(
  "/",
  verifyUser,
  Upload.single("image"),
  cloudUpload.uploadToCloud,
  createPost
);
router.get("/:id", verifyUser, getPost);
router.delete("/:id", verifyUser, deletePost);
router.put("/like/:id", verifyUser, likePost);
router.get("/timeline/:id", verifyUser, getTimelinePosts);
router.post("/reportPost/:id", verifyUser, reportPost);

export default router;
