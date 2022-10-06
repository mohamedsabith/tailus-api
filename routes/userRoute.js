/* eslint-disable import/extensions */
import express from "express";
import {
  followUser,
  getAllUsers,
  getUser,
  suggestedUsers,
  userDetails,
} from "../controllers/userController.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = express.Router();

router.get("/suggestion/:id", verifyUser, suggestedUsers);
router.get("/getAllUsers", verifyUser, getAllUsers);
router.get("/:id", getUser);
router.put("/follow/:id", verifyUser, followUser);
router.post("/userDetails", verifyUser, userDetails);

export default router;
