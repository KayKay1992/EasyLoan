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
  try {
    console.log('Update profile request received:', req.body);
    const startTime = Date.now();

    const user = await User.findById(req.user.id);
    console.log('User fetch time:', Date.now() - startTime, 'ms');
    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate email format if being updated
    if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    // Validate profileImageUrl if provided
    if (req.body.profileImageUrl) {
      try {
        new URL(req.body.profileImageUrl);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile image URL',
        });
      }
    }

    // Update fields
    user.name = req.body.name || user.name;
    if (req.body.email && req.body.email !== user.email) {
      console.log('Checking email availability:', req.body.email);
      const emailExists = await User.findOne({ email: req.body.email });
      console.log('Email check time:', Date.now() - startTime, 'ms');
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      user.email = req.body.email;
    }

    if (req.body.profileImageUrl) {
      user.profileImageUrl = req.body.profileImageUrl;
    }

    if (req.body.password) {
      console.log('Hashing password...');
      if (req.body.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
      console.log('Password hash time:', Date.now() - startTime, 'ms');
    }

    console.log('Saving user...');
    const updatedUser = await user.save();
    console.log('User save time:', Date.now() - startTime, 'ms');

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImageUrl: updatedUser.profileImageUrl,
        token: generateToken(updatedUser._id),
      },
    });
  } catch (error) {
    console.error('Profile update error:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      user: req.user,
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during profile update',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getUserProfile,
  updateUserProfile
};
