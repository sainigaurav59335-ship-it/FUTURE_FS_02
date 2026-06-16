const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token expires in 30 days
  });
};

// @desc    Register a new admin user
// @route   POST /api/auth/register
// @access  Public
const registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Basic validation
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Please provide username, email, and password' });
    }

    // Check if user already exists by email
    const userExistsByEmail = await User.findOne({ email });
    if (userExistsByEmail) {
      return res
        .status(400)
        .json({ success: false, error: 'Email already registered' });
    }

    // Check if user already exists by username
    const userExistsByUsername = await User.findOne({ username });
    if (userExistsByUsername) {
      return res
        .status(400)
        .json({ success: false, error: 'Username already taken' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id)
        }
      });
    } else {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid user data' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Authenticate admin user & get token
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Please provide email and password' });
    }

    // Find user (explicitly selecting password)
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id)
        }
      });
    } else {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getMe
};
