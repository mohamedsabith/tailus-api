/* eslint-disable import/extensions */
import jwt from "jsonwebtoken";
import { Decrypt } from "../utils/crypto.js";

const verifyLogin = async (req, res, next) => {
  const token = req.header("authtoken");

  if (!token) {
    return res.status(401).json({ status: false, msg: "Access Denied" });
  }

  try {
    const decryptToken = await Decrypt(token);
    const verify = jwt.verify(decryptToken, process.env.ACCESS_JWT_TOKEN);
    req.user = verify;
    next();
  } catch (error) {
    res.status(400).json({ status: false, msg: "Invalid Token" });
  }
};

export default verifyLogin;
