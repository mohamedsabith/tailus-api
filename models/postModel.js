import mongoose from "mongoose";
import moment from "moment";

const postSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    image: String,
    caption: String,
    hashtags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: String,
      default: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
    },
  },
  {
    timestamps: true,
  }
);

const PostModel = mongoose.model("Posts", postSchema);

export default PostModel;
