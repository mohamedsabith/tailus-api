/* eslint-disable import/extensions */
import jwt from "jsonwebtoken";
import { Decrypt } from "../utils/crypto.js";

const verifyLogin = async (req, res, next) => {
  const token = req.header("authtoken");
  console.log(token);
  if (!token) {
    return res.status(401).json({ status: false, error: "Access Denied" });
  }

  try {
    const decryptToken = await Decrypt(token);
    const verify = jwt.verify(decryptToken, process.env.ACCESS_JWT_TOKEN);
    req.user = verify;
    next();
  } catch (error) {
    return res.status(400).json({ status: false, error: "Token Expired" });
  }
};

export default verifyLogin;
