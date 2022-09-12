/* eslint-disable import/extensions */
import mongoose from "mongoose";
import PostModel from "../models/postModel.js";
import UserModel from "../models/userModel.js";

// creating a post

export const createPost = async (req, res) => {
  const newPost = new PostModel(req.body);
  try {
    await newPost.save();
    return res.status(200).json(newPost);
  } catch (error) {
    return res.status(500).json(error);
  }
};

// get a post

export const getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await PostModel.findById(id);
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json(error);
  }
};

// update post
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      return res.status(200).json("Post updated!");
    }
    return res.status(403).json("Authentication failed");
  } catch (error) {
    return res.status(500).json(error);
  }
};

// delete a post
export const deletePost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      await post.deleteOne();
      return res.status(200).json("Post deleted.");
    }
    return res.status(403).json("Action forbidden");
  } catch (error) {
    return res.status(500).json(error);
  }
};

// like/dislike a post
export const likePost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(id);
    if (post.likes.includes(userId)) {
      await post.updateOne({ $pull: { likes: userId } });
      return res.status(200).json("Post disliked");
    }
    await post.updateOne({ $push: { likes: userId } });
    return res.status(200).json("Post liked");
  } catch (error) {
    return res.status(500).json(error);
  }
};

// Get timeline posts
export const getTimelinePosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const currentUserPosts = await PostModel.find({ userId: userId });

    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
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
    return res.status(500).json(error);
  }
};
