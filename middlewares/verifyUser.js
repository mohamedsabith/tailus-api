import jwt from "jsonwebtoken";

const verifyLogin = (req, res, next) => {
  const token = req.header("authtoken");
  console.log(token);
  if (!token) {
    return res.status(401).json({ status: false, msg: "Access Denied" });
  }

  try {
    const verify = jwt.verify(token, process.env.SIGNIN_TOKEN_KEY_JWT);
    req.user = verify;
    next();
  } catch (error) {
    res.status(400).json({ status: false, msg: "Invalid Token" });
  }
};

export default verifyLogin;
