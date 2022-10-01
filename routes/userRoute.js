/* eslint-disable import/extensions */
import express from "express";
import {
  followUser,
  getAllUsers,
  getUser,
} from "../controllers/userController.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = express.Router();

router.get("/", verifyUser, getAllUsers);
router.get("/:id", getUser);
router.put("/follow/:id", verifyUser, followUser);
router.get("/verifyToken", verifyUser);
export default router;
