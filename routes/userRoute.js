/* eslint-disable import/extensions */
import express from "express";
import {
  followUser,
  getAllUsers,
  getUser,
} from "../controllers/userController.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = express.Router();

router.get("/:id", getUser);
router.get("/", verifyUser, getAllUsers);
router.put("/follow/:id", verifyUser, followUser);

export default router;
