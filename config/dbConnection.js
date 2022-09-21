import mongoose from "mongoose";
import chalk from "chalk";

const { CONNECTION_URL } = process.env;

const dbConnection = () => {
  mongoose
    .connect(CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log(chalk.blue("Database Connected successfully")))
    .catch((error) => console.log(chalk.red(`${error} did not connect`)));
};

export default dbConnection;
