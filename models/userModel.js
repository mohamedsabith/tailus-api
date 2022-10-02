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
      default:
        "https://res.cloudinary.com/dpxi2tqqw/image/upload/v1664708308/person_default_qfvfkk.jpg",
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
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
  },
  { timestamps: true }
);

userSchema.index({ username: 1, email: 1 });

const userModel = mongoose.model("User", userSchema);

export default userModel;
