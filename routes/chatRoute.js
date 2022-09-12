/* eslint-disable import/extensions */
import express from "express";
import {
  createChat,
  findChat,
  userChats,
} from "../controllers/chatController.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = express.Router();

router.post("/", verifyUser, createChat);
router.get("/:userId", verifyUser, userChats);
router.get("/find/:firstId/:secondId", verifyUser, findChat);

export default router;
