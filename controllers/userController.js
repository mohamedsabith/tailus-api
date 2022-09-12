/* eslint-disable import/extensions */
import UserModel from "../models/userModel.js";

// Get a User
export const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;

      return res.status(200).json(otherDetails);
    }
    return res.status(404).json("No such User");
  } catch (error) {
    return res.status(500).json(error);
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    let users = await UserModel.find();
    users = users.map((user) => {
      const { password, ...otherDetails } = user._doc;
      return otherDetails;
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json(error);
  }
};

// Follow a User
export const followUser = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.body;
  if (_id === id) {
    return res.status(403).json("Action Forbidden");
  }
  try {
    const FollowUser = await UserModel.findById(id);
    const followingUser = await UserModel.findById(_id);

    if (!followUser.followers.includes(_id)) {
      await FollowUser.updateOne({ $push: { followers: _id } });
      await followingUser.updateOne({ $push: { following: id } });
      return res.status(200).json("User followed!");
    }
    return res.status(403).json("you are already following this id");
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

// Unfollow a User
export const unfollowUser = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.body;

  if (_id === id) {
    return res.status(403).json("Action Forbidden");
  }
  try {
    const unFollowUser = await UserModel.findById(id);
    const unFollowingUser = await UserModel.findById(_id);

    if (unFollowUser.followers.includes(_id)) {
      await unFollowUser.updateOne({ $pull: { followers: _id } });
      await unFollowingUser.updateOne({ $pull: { following: id } });
      return res.status(200).json("Unfollowed Successfully!");
    }
    return res.status(403).json("You are not following this User");
  } catch (error) {
    return res.status(500).json(error);
  }
};
