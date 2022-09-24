import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Please enter username"],
      minlength: [3, "Username must be of minimum 3 characters"],
      unique: [true, "Username already exists"],
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "Please enter email"],
      unique: [true, "Email already exists"],
      trim: true,
      validate: (value) => {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address.");
        }
      },
    },
    phoneNumber: {
      type: Number,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
      minlength: [8, "Password must be of minimum 8 characters"],
    },
    avatar: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "Hi👋 Welcome To My Profile",
      maxlength: 130,
    },
    website: {
      type: String,
      maxlength: 65,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    saved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    private: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

userSchema.index({ username: 1, email: 1 });

const userModel = mongoose.model("User", userSchema);

export default userModel;
