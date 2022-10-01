/* eslint-disable import/extensions */
import mongoose from "mongoose";
import * as linkify from "linkifyjs";
import "linkify-plugin-hashtag";
import PostModel from "../models/postModel.js";
import UserModel from "../models/userModel.js";
import validateMongodbid from "../utils/validateMongodbId.js";

// creating a post
export const createPost = async (req, res) => {
  const { userId, caption } = req.body;
  try {
    if (!req.image) {
      return res
        .status(404)
        .send({ status: false, error: "Please provide the image to upload." });
    }
    if (!userId) {
      return res
        .status(404)
        .send({ status: false, error: "Please provide userId." });
    }
    const hashtags = [];
    linkify.find(caption).forEach((result) => {
      if (result.type === "hashtag") {
        hashtags.push(result.value.substring(1));
      }
    });

    // checking mongodb id valid or not
    await validateMongodbid(userId);

    // saving to DB
    const newPost = new PostModel({
      userId: mongoose.Types.ObjectId(userId),
      caption: caption,
      hashtags,
      image: req.image.secure_url,
    });

    await newPost.save(async (err) => {
      if (err) {
        console.log(err.message);
        return res.status(404).json({ status: false, error: err.message });
      }
      return res
        .status(200)
        .json({ message: "Post Created Successfully", status: true });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

// get a post
export const getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await PostModel.findById(id).lean().populate("userId");
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post cannot be found, please verify." });
    }
    return res.status(200).json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

// delete a post
export const deletePost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(id);

    if (!post) {
      return res
        .status(404)
        .json({ status: false, message: "Post Not Found." });
    }

    if (post.userId.toString() === mongoose.Types.ObjectId(userId).toString()) {
      await post.deleteOne();
      return res.status(200).json({ status: true, message: "Post deleted." });
    }
    return res.status(403).json({ status: false, message: "Action forbidden" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

// like/dislike a post
export const likePost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(mongoose.Types.ObjectId(id));
    if (!post) {
      return res
        .status(404)
        .json({ status: false, message: "Post Not Found." });
    }
    if (post.likes.includes(mongoose.Types.ObjectId(userId))) {
      await post.updateOne({ $pull: { likes: userId } });
      return res.status(200).json({ status: true, message: "Post disliked" });
    }
    await post.updateOne({ $push: { likes: userId } });
    return res.status(200).json({ status: true, message: "Post liked" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

// Get timeline posts
export const getTimelinePosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const currentUserPosts = await PostModel.find({
      userId: mongoose.Types.ObjectId(userId),
    }).populate("userId");

    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "following",
          foreignField: "userId",
          as: "followingPosts",
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);
    return res
      .status(200)
      .json(
        currentUserPosts
          .concat(...followingPosts[0].followingPosts)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
