const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

//@desc  Get All Users (adminOnly)
//@route Get /api/users/
//@access admin only
const getUsers = async (req, next) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};

//@desc  Get user by id
//@route Get /api/users/:id
//@access private
const getUserById = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};

//@desc  Delete a user
//@route Delete /api/users/:id
//@access admin
const deleteUser = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};

module.exports= {getUsers, getUserById, deleteUser}
