/* eslint-disable import/extensions */
import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  getTimelinePosts,
  likePost,
  updatePost,
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
router.put("/:id", verifyUser, updatePost);
router.delete("/:id", verifyUser, deletePost);
router.put("/:id/like", verifyUser, likePost);
router.get("/:id/timeline", verifyUser, getTimelinePosts);

export default router;
