import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Game from '../models/Game.js';
import Order from '../models/Order.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('library.gameId', 'title capsuleImage price developer')
      .populate('wishlist', 'title capsuleImage price developer discount originalPrice')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's order history
    const orders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      user: {
        ...user,
        orderHistory: orders
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username, email, firstName, lastName, avatar, country, dateOfBirth, preferences } = req.body;

    // Check if username or email is already taken by another user
    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: req.user._id },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : [])
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          message: existingUser.email === email 
            ? 'Email already taken' 
            : 'Username already taken'
        });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (avatar) updateData.avatar = avatar;
    if (country !== undefined) updateData.country = country;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/library
// @desc    Get user's game library
// @access  Private
router.get('/library', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'library.gameId',
        select: 'title capsuleImage price developer tags rating reviewCount'
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out any null games (in case a game was deleted)
    const library = user.library.filter(item => item.gameId);

    res.json({ library });
  } catch (error) {
    console.error('Get library error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'title capsuleImage price developer tags rating reviewCount discount originalPrice')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out any null games (in case a game was deleted)
    const wishlist = user.wishlist.filter(game => game);

    res.json({ wishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/wishlist/:gameId
// @desc    Add/remove game from wishlist
// @access  Private
router.post('/wishlist/:gameId', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const user = await User.findById(req.user._id);
    const added = user.toggleWishlist(req.params.gameId);
    await user.save();

    res.json({
      message: added ? 'Game added to wishlist' : 'Game removed from wishlist',
      added,
      wishlistCount: user.wishlist.length
    });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid game ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/library/:gameId/playtime
// @desc    Update game playtime
// @access  Private
router.put('/library/:gameId/playtime', [
  auth,
  body('playtime')
    .isInt({ min: 0 })
    .withMessage('Playtime must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { playtime } = req.body;
    const user = await User.findById(req.user._id);

    const libraryItem = user.library.find(
      item => item.gameId.toString() === req.params.gameId
    );

    if (!libraryItem) {
      return res.status(404).json({ message: 'Game not found in library' });
    }

    libraryItem.playtime = playtime;
    await user.save();

    res.json({
      message: 'Playtime updated successfully',
      playtime
    });
  } catch (error) {
    console.error('Update playtime error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid game ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/public
// @desc    Get user's public profile
// @access  Public
router.get('/:id/public', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username avatar firstName lastName country preferences.privacy library wishlist createdAt')
      .populate('library.gameId', 'title capsuleImage')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check privacy settings
    if (user.preferences.privacy === 'private') {
      return res.status(403).json({ message: 'This profile is private' });
    }

    // Remove sensitive data based on privacy settings
    const publicProfile = {
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      memberSince: user.createdAt
    };

    if (user.preferences.privacy === 'public') {
      publicProfile.libraryCount = user.library.length;
      publicProfile.wishlistCount = user.wishlist.length;
      publicProfile.recentGames = user.library
        .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
        .slice(0, 6)
        .map(item => ({
          game: item.gameId,
          purchaseDate: item.purchaseDate,
          playtime: item.playtime
        }));
    }

    res.json({ user: publicProfile });
  } catch (error) {
    console.error('Get public profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private (Admin)
router.put('/:id/role', [
  auth,
  adminAuth,
  body('role')
    .isIn(['user', 'admin', 'developer'])
    .withMessage('Role must be user, admin, or developer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Activate/deactivate user (Admin only)
// @access  Private (Admin)
router.put('/:id/status', [
  auth,
  adminAuth,
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;