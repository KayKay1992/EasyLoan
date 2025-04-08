const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
// const bcrypt = require("bcryptjs");
const Loan = require("../models/loan.model");

//@desc  Get All Users (adminOnly)
//@route Get /api/users/
//@access admin only
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");

  const usersWithLoanData = await Promise.all(
    users.map(async (user) => {
      const totalLoans = await Loan.countDocuments({ user: user._id });
      const activeLoans = await Loan.countDocuments({
        user: user._id,
        status: "active",
      });
      const completedLoans = await Loan.countDocuments({
        user: user._id,
        status: "completed",
      });

      return {
        ...user._doc,
        totalLoans,
        activeLoans,
        completedLoans,
      };
    })
  );

  res.json(usersWithLoanData);
});

//@desc  Get user by id
//@route Get /api/users/:id
//@access private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "user not found" });
  res.json(user);
});

//@desc  Delete a user
//@route Delete /api/users/:id
//@access admin
// const deleteUser = async (req, res) => {
//   try {
//   } catch (error) {
//     res.status(500).json({
//       message: "server error",
//       error: error.message,
//     });
//   }
// };

module.exports = { getUsers, getUserById };
