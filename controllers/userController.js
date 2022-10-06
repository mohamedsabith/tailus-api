/* eslint-disable import/extensions */
import chalk from "chalk";
import mongoose from "mongoose";
import UserModel from "../models/userModel.js";
import PostModel from "../models/postModel.js";

// Get a User
export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id)
      .populate("posts")
      .sort({ createdAt: -1 });
    const currentUserPosts = await PostModel.find({ userId: id }).sort({
      createdAt: -1,
    });
    if (user) {
      const { password, ...userDetails } = user._doc;
      return res.status(200).json({ userDetails, currentUserPosts });
    }
    return res.status(404).json({ status: false, message: "No such a user." });
  } catch (error) {
    return res.status(500).json(error);
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    let users = await UserModel.find().sort({ createdAt: -1 });
    users = users.map((user) => {
      const { password, ...otherDetails } = user._doc;
      return otherDetails;
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const suggestedUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await UserModel.find().sort({ createdAt: -1 });
    const suggestedUsers = users
      .filter(
        (u) =>
          !u.followers.includes(mongoose.Types.ObjectId(id)) &&
          u._id.toString() !== id.toString()
      )
      .slice(-5);
    return res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

// Follow | Unfollow User
export const followUser = async (req, res) => {
  try {
    const userToFollow = await UserModel.findById(req.params.id);
    const loggedInUser = await UserModel.findById(req.body.userId);

    if (!userToFollow || !loggedInUser) {
      return res.status(400).json({ status: false, message: "User not found" });
    }
    if (userToFollow.toString() === loggedInUser.toString()) {
      return res
        .status(400)
        .json({ status: false, message: "Not follow yourself" });
    }
    if (loggedInUser.following.includes(userToFollow._id)) {
      const followingIndex = loggedInUser.following.indexOf(userToFollow._id);
      const followerIndex = userToFollow.followers.indexOf(loggedInUser._id);
      loggedInUser.following.splice(followingIndex, 1);
      userToFollow.followers.splice(followerIndex, 1);

      await loggedInUser.save();
      await userToFollow.save();

      return res.status(200).json({
        success: true,
        message: "User Unfollowed",
      });
    }
    loggedInUser.following.push(userToFollow._id);
    userToFollow.followers.push(loggedInUser._id);
    await loggedInUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: "User Followed",
    });
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(404).json(error);
  }
};

export const userDetails = async (req, res) => {
  try {
    const { userIds } = req.body;
    const details = [];
    if (!userIds || userIds.length === 0 || Array.isArray(userIds) === false) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide userIds." });
    }
    userIds.forEach(async (data) => {
      const user = await UserModel.findById(mongoose.Types.ObjectId(data));
      details.push(user);
      return res.status(200).json(details);
    });
  } catch (error) {
    console.log(chalk.red(error));
    return res.status(404).json(error);
  }
};
