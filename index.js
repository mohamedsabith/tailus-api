/* eslint-disable import/extensions */
import express from "express";
import helmet from "helmet";
import cors from "cors";
import chalk from "chalk";
import logger from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dbConnection from "./config/dbConnection.js";
import limiter from "./middlewares/rateLimiter.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import "dotenv/config";

// Routes
import authRoute from "./routes/authRoute.js";
import UserRoute from "./routes/userRoute.js";
import PostRoute from "./routes/postRoute.js";
import ChatRoute from "./routes/chatRoute.js";
import MessageRoute from "./routes/messageRoute.js";

// Database Connection
dbConnection();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(helmet());
app.use(limiter);
app.use(errorHandler);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  }
);

app.use(logger("combined", { stream: accessLogStream }));
app.get("/", (req, res) => res.send("TAILUS API IS WORKING"));
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", UserRoute);
app.use("/api/v1/post", PostRoute);
app.use("/api/v1/chat", ChatRoute);
app.use("/api/v1/message", MessageRoute);

app.all("*", (req, res) => {
  res.status(404).json({
    status: false,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

const { PORT } = process.env;

app.listen(PORT, (err) => {
  if (err) console.log(chalk.red(`Server failed to start Error > ${err}`));
  console.log(chalk.blue(`Server Running on Port: http://localhost:${PORT}`));
});
