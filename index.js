/* eslint-disable import/extensions */
import express from "express";
import responseTime from "response-time";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import chalk from "chalk";
import logger from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import mongoose from "mongoose";
import "dotenv/config";
import errorHandler from "./middlewares/errorMiddleware.js";

// Routes
import authRoute from "./routes/authRoute.js";
import UserRoute from "./routes/userRoute.js";
import PostRoute from "./routes/postRoute.js";
import ChatRoute from "./routes/chatRoute.js";
import MessageRoute from "./routes/messageRoute.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many request from this IP",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(responseTime());
app.use(limiter);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  }
);

app.use(logger("combined", { stream: accessLogStream }));
app.use(errorHandler);
app.get("/", (req, res) => res.send("TAILUS API IS WORKING"));
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", UserRoute);
app.use("/api/v1/post", PostRoute);
app.use("/api/v1/chat", ChatRoute);
app.use("/api/v1/message", MessageRoute);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "false",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

const { PORT } = process.env;
const { CONNECTION_URL } = process.env;

mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(PORT, () =>
      console.log(
        chalk.blue(`Server Running on Port: http://localhost:${PORT}`)
      )
    )
  )
  .catch((error) => console.log(chalk.red(`${error} did not connect`)));
