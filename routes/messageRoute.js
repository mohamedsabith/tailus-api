/* eslint-disable import/extensions */
import express from "express";
import { addMessage, getMessages } from "../controllers/messageController.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = express.Router();

router.post("/", verifyUser, addMessage);

router.get("/:chatId", verifyUser, getMessages);

export default router;
