const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  // TODO: handle registration
  const {name, email, password, profileImageUrl,adminInviteToken }=req.body

        //check if user already exists
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: 'user already exist'})
        }
        
        //Determine user role: if correct, token is provided, otherwise memeber.
        let role = 'user'
        if(adminInviteToken && adminInviteToken == process.env.ADMIN_INVITE_TOKEN){
            role = 'admin'
        }

        //hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        //Create New User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role
        })

        //return user data with jwt 
        res.status(201).json({
            _id: user._id,
            name:user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            role:user.role,
            token: generateToken(user._id)
        })
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  // TODO: handle login
  const {email, password} = req.body

  //check for a user with this particular email
  const user = await User.findOne({email})

  //if no user return an error
  if(!user){
      return res.status(401).json({message: 'Invalid Email or Password'})
  }

  //compare password and if it doesnt match return error
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch){
      return res.status(401).json({message: 'Invalid Email or Password'})  
  }

  //return user data with jwt
  res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id)
  })

});

// @desc    Get current logged-in user (basic info)
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  // TODO: return req.user (set in middleware)
   // The user info is attached to req.user by the protect middleware
   const user = await User.findById(req.user._id).select('-password'); // Exclude password from response

   if (!user) {
     res.status(404);
     throw new Error('User not found');
   }
 
   res.status(200).json({
     _id: user._id,
     name: user.name,
     email: user.email,
     profileImageUrl: user.profileImageUrl,
     role: user.role,
   });
});

// @desc    Get full user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // TODO: fetch and return user profile
  const user = await User.findById(req.user.id).select('-password')
  if(!user){
      return res.status(404).json({
          message: 'User Not Found'
      })
  }
  res.json(user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  // TODO: update and return updated profile
  const user = await User.findById(req.user.id);
  if(!user){
      return res.status(404).json({message: 'User not found'})
  }
  user.name = req.body.name || user.name;
  user.email= req.body.email || user.email;
  user.role=req.body.role||user.role;

  if(req.body.password){
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt)
  }

  const updatedUser = await user.save()
  res.json({
      _id: updatedUser._id,
      name:updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id)
  })
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getUserProfile,
  updateUserProfile
};
