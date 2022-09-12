/* eslint-disable import/extensions */
import express from "express";
import {
  followUser,
  getAllUsers,
  getUser,
  unfollowUser,
} from "../controllers/userController.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = express.Router();

router.get("/:id", getUser);
router.get("/", getAllUsers);
router.put("/:id/follow", verifyUser, followUser);
router.put("/:id/unfollow", verifyUser, unfollowUser);

export default router;
