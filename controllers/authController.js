/* eslint-disable import/extensions */
import chalk from "chalk";
import "dotenv/config";
import twilio from "twilio";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {
  signUpvalidation,
  signInValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validators/authValidator.js";
import { Encrypt } from "../utils/crypto.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import userModel from "../models/userModel.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// USER SIGNUP
const signUp = async (req, res) => {
  try {
    // signup validation
    const Validations = await signUpvalidation(req.body);

    if (Validations.error) {
      return res.status(400).json({
        status: false,
        error: Validations.error.details[0].message.replace(/"/g, ""),
      });
    }

    const { username, email, phoneNumber } = req.body;
    // checking user already exist
    const user = await userModel.findOne({
      $or: [{ email }, { phoneNumber }, { username: username }],
    });

    if (user) {
      // checking username already exist
      if (user.username === username) {
        return res
          .status(400)
          .json({ status: false, error: "Username already taken." });
      }
      // checking email already exist
      if (user.email === email) {
        return res.status(400).json({
          status: false,
          error: "Another account is using this email.",
        });
      }
      // checking number already exist
      return res.status(400).json({
        status: false,
        error: "Another account is using this number.",
      });
    }

    // Send Otp
    try {
      client.verify.v2
        .services(process.env.TWILIO_SERVICE_ID)
        .verifications.create({
          to: `+91${phoneNumber}`,
          channel: "sms",
        })
        // eslint-disable-next-line arrow-body-style
        .then(({ status }) => {
          return res.status(200).json({ status, userDetails: req.body });
        })
        .catch((error) => {
          console.log(chalk.red(error));
          return res.status(500).json(error);
        });
    } catch (error) {
      console.log(chalk.red(error));
      return res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(404).json(error);
  }
};

// USER SIGN UP WITH GOOGLE
const googleSignUp = async (req, res) => {
  try {
    const { email, fullname, password } = req.body;

    // checking user already exist
    const user = await userModel.findOne({ email: email });

    if (user) {
      return res.status(400).json({
        status: false,
        error: "Another account is using this email or number.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const generatingUsername = email.replace("@gmail.com", "");
    // saving to DB
    const newUser = new userModel({
      email: email,
      username: generatingUsername,
      fullname: fullname,
      password: hashedPassword,
    });

    await newUser.save(async (err, result) => {
      if (err) {
        console.log(err.message);
        return res.status(400).json({ status: false, error: err.message });
      }
      // Generating JWT token
      const token = await generateAccessToken(
        result.email,
        result.username,
        result._id
      );
      const refreshToken = await generateRefreshToken(
        result.email,
        result.username,
        result._id
      );
      // token encrypting
      const encryptToken = await Encrypt(token);
      const { password, ...userDetails } = result._doc;
      await userModel.findByIdAndUpdate(
        { _id: result._id },
        { $set: { refreshToken: refreshToken } }
      );
      console.log(chalk.green("Register Successfully"));
      return res.status(200).json({
        status: true,
        message: "Register Successfully",
        token: encryptToken,
        refreshToken,
        userDetails,
      });
    });
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(404).json(error);
  }
};

// OTP VERIFICATION
const otpVerification = (req, res) => {
  try {
    const { phoneNumber, email, username, fullname, password, Otp } = req.body;
    client.verify
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: Otp,
      })
      .then(async (response) => {
        if (response.valid) {
          const hashedPassword = await bcrypt.hash(password, 12);
          // saving to DB
          const newUser = new userModel({
            email: email,
            phoneNumber: phoneNumber,
            username: username,
            fullname: fullname,
            password: hashedPassword,
          });
          newUser.save(async (err, result) => {
            if (err) {
              console.log(err.message);
              return res
                .status(400)
                .json({ status: false, error: err.message });
            }
            // Generating JWT token
            const token = await generateAccessToken(
              result.email,
              result.username,
              result._id
            );
            const refreshToken = await generateRefreshToken(
              result.email,
              result.username,
              result._id
            );
            const encryptToken = await Encrypt(token);
            const { password, ...userDetails } = result._doc;
            await userModel.findByIdAndUpdate(
              { _id: result._id },
              { $set: { refreshToken: refreshToken } }
            );
            console.log(chalk.green("Register Successfully"));
            return res.status(201).json({
              status: true,
              message: "Register Successfully",
              token: encryptToken,
              refreshToken,
              userDetails,
            });
          });
        } else {
          return res.status(400).json({
            status: false,
            error: "Failed to authenticate. Otp code is invalid",
          });
        }
      });
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(404).json(error);
  }
};

// USER SIGNIN
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validating Data
    const dataValidation = await signInValidation(req.body);

    if (dataValidation.error) {
      return res.status(400).json({
        status: false,
        error: dataValidation.error.details[0].message.replace(/"/g, ""),
      });
    }
    // checking if user exist in DB
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        status: false,
        error:
          "The email you entered doesn't belong to an account. Please check your email and try again.",
      });
    }
    // Comparing plain password to hashed password
    await bcrypt.compare(password, user.password).then(async (status) => {
      if (!status) {
        return res.status(400).json({
          status: false,
          error:
            "Your password was incorrect. Please double-check your password.",
        });
      }

      // Generating JWT token
      const token = await generateAccessToken(
        user.email,
        user.username,
        user._id
      );
      const refreshToken = await generateRefreshToken(
        user.email,
        user.username,
        user._id
      );

      const { password, ...userDetails } = user._doc;
      const encryptToken = await Encrypt(token);
      await userModel.findByIdAndUpdate(
        { _id: user._id },
        { $set: { refreshToken: refreshToken } }
      );
      console.log(chalk.green("Login Successfully"));
      return res.status(200).json({
        status: "ok",
        msg: "Sign in Success",
        token: encryptToken,
        refreshToken,
        userDetails,
      });
    });
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(404).json(error);
  }
};

// USER FORGOT PASSWORD
const ForgotPassword = async (req, res) => {
  try {
    const dataValidation = await forgotPasswordValidation(req.body);

    if (dataValidation.error) {
      return res.status(400).json({
        status: false,
        error: dataValidation.error.details[0].message,
      });
    }

    // Checking if user exist
    const user = await userModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({
        status: false,
        error:
          "The email you entered doesn't belong to an account. Please check your email and try again.",
      });
    }

    // Generating reset token
    const token = await Jwt.sign(
      { id: user._id, name: user.username, email: user.email },
      process.env.JWT_RESET_PASSWORD_KEY,
      { expiresIn: "5m" }
    );
    try {
      const transporter = await nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
          user: process.env.GOOGLE_APP_EMAIL,
          pass: process.env.GOOGLE_APP_PASS,
        },
      });

      const mailOptions = {
        from: "mohamedsabithmp@gmail.com",
        to: req.body.email,
        subject: "Reset Account Password Link",
        html: `
        <h3>Please click the link below to reset your password</h3>
        <P>${process.env.CLIENT_URL}/resetPassword/${token}</P>
        `,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.log(chalk.red(error));
          return res.status(400).json({
            status: false,
            error: "Something went wrong. please try again later",
          });
        }
        console.log(chalk.green(`Email successfully sent ${req.body.email}`));
        return res.status(200).json({
          status: "ok",
          message: "Check your email for a link to reset your password",
          token,
        });
      });
    } catch (error) {
      console.log(chalk.red(error));
      return res.status(404).json(error);
    }
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(404).json(error);
  }
};

// USER RESET PASSWORD
const ResetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  try {
    Jwt.verify(
      token,
      process.env.JWT_RESET_PASSWORD_KEY,
      async (err, decodedToken) => {
        if (err) {
          return res.status(400).json({
            status: false,
            error: "Your password reset link has expired",
          });
        }
        const data = { password, confirmPassword };
        // Data Validation
        const dataValidation = await resetPasswordValidation(data);

        if (dataValidation.error) {
          return res.status(400).json({
            status: false,
            error: dataValidation.error.details[0].message,
          });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await userModel
          .findByIdAndUpdate(
            { _id: decodedToken.id },
            { $set: { password: hashedPassword } }
          )
          .then(() =>
            res.status(200).json({
              status: "ok",
              msg: "Your password successfully changed.",
            })
          )
          // eslint-disable-next-line no-shadow
          .catch((err) => {
            console.log(chalk.red(err));
            return res.status(400).json({
              status: false,
              error: "Something went wrong. please try again later",
            });
          });
      }
    );
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(404).json(error);
  }
};

const handleRefreshToken = async (req, res) => {
  try {
    const { userId, refreshToken } = req.body;
    if (!userId || !refreshToken) {
      return res.status(401).json("You are not authenticated!");
    }
    const user = userModel.findById(userId);
    if (!user) {
      return res.status(401).json("User Not Found!");
    }
    if (user.refreshToken !== refreshToken) {
      return res.status(403).json("Refresh token is not valid!");
    }
    Jwt.verify(refreshToken, process.env.REFRESH_JWT_TOKEN, async (err) => {
      if (err) {
        return res.status(404).json(err.message);
      }
      const token = generateAccessToken(user.email, user.username, user._id);
      const encryptToken = await Encrypt(token);
      res.status(200).json({
        message: "New Token Created Successfully",
        status: true,
        token: encryptToken,
      });
    });
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(404).json(error);
  }
};

export {
  signUp,
  otpVerification,
  signIn,
  ForgotPassword,
  ResetPassword,
  googleSignUp,
  handleRefreshToken,
};
