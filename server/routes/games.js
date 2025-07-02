import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Game from '../models/Game.js';
import Review from '../models/Review.js';
import { optionalAuth, auth, adminAuth, developerAuth, editorAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/games
// @desc    Get all games with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['title', 'price', 'rating', 'releaseDate', 'salesCount']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Min rating must be between 0 and 5'),
  query('tags').optional().isString().withMessage('Tags must be a string'),
  query('categories').optional().isString().withMessage('Categories must be a string'),
  query('platforms').optional().isString().withMessage('Platforms must be a string')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      page = 1,
      limit = 12,
      sort = 'releaseDate',
      order = 'desc',
      search,
      minPrice,
      maxPrice,
      minRating,
      tags,
      categories,
      platforms,
      featured,
      popular,
      newRelease
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (minRating !== undefined) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Categories filter
    if (categories) {
      const categoryArray = categories.split(',').map(cat => cat.trim());
      filter.categories = { $in: categoryArray };
    }

    // Platforms filter
    if (platforms) {
      const platformArray = platforms.split(',').map(platform => platform.trim());
      filter.platforms = { $in: platformArray };
    }

    // Special filters
    if (featured === 'true') filter.isFeatured = true;
    if (popular === 'true') filter.isPopular = true;
    if (newRelease === 'true') filter.isNewRelease = true;

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Add text score for search results
    if (search) {
      sortObj.score = { $meta: 'textScore' };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [games, totalCount] = await Promise.all([
      Game.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Game.countDocuments(filter)
    ]);

    // Add user-specific data if authenticated
    if (req.user) {
      games.forEach(game => {
        game.isInLibrary = req.user.ownsGame(game._id);
        game.isInWishlist = req.user.wishlist.includes(game._id);
      });
    }

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      games,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        sort,
        order,
        search,
        minPrice,
        maxPrice,
        minRating,
        tags,
        categories,
        platforms
      }
    });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/featured
// @desc    Get featured games
// @access  Public
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const games = await Game.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .sort({ rating: -1 })
    .limit(6)
    .lean();

    // Add user-specific data if authenticated
    if (req.user) {
      games.forEach(game => {
        game.isInLibrary = req.user.ownsGame(game._id);
        game.isInWishlist = req.user.wishlist.includes(game._id);
      });
    }

    res.json({ games });
  } catch (error) {
    console.error('Get featured games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/popular
// @desc    Get popular games
// @access  Public
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    const games = await Game.find({ 
      isActive: true, 
      isPopular: true 
    })
    .sort({ salesCount: -1 })
    .limit(8)
    .lean();

    // Add user-specific data if authenticated
    if (req.user) {
      games.forEach(game => {
        game.isInLibrary = req.user.ownsGame(game._id);
        game.isInWishlist = req.user.wishlist.includes(game._id);
      });
    }

    res.json({ games });
  } catch (error) {
    console.error('Get popular games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/new-releases
// @desc    Get new release games
// @access  Public
router.get('/new-releases', optionalAuth, async (req, res) => {
  try {
    const games = await Game.find({ 
      isActive: true, 
      isNewRelease: true 
    })
    .sort({ releaseDate: -1 })
    .limit(8)
    .lean();

    // Add user-specific data if authenticated
    if (req.user) {
      games.forEach(game => {
        game.isInLibrary = req.user.ownsGame(game._id);
        game.isInWishlist = req.user.wishlist.includes(game._id);
      });
    }

    res.json({ games });
  } catch (error) {
    console.error('Get new releases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/:id
// @desc    Get single game by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const game = await Game.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).lean();

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Add user-specific data if authenticated
    if (req.user) {
      game.isInLibrary = req.user.ownsGame(game._id);
      game.isInWishlist = req.user.wishlist.includes(game._id);
    }

    // Get recent reviews
    const reviews = await Review.find({ 
      gameId: game._id, 
      isVisible: true 
    })
    .populate('userId', 'username avatar')
    .sort({ helpful: -1, createdAt: -1 })
    .limit(10)
    .lean();

    game.recentReviews = reviews;

    res.json({ game });
  } catch (error) {
    console.error('Get game error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid game ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/slug/:slug
// @desc    Get single game by slug
// @access  Public
router.get('/slug/:slug', optionalAuth, async (req, res) => {
  try {
    const game = await Game.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    }).lean();

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Add user-specific data if authenticated
    if (req.user) {
      game.isInLibrary = req.user.ownsGame(game._id);
      game.isInWishlist = req.user.wishlist.includes(game._id);
    }

    // Get recent reviews
    const reviews = await Review.find({ 
      gameId: game._id, 
      isVisible: true 
    })
    .populate('userId', 'username avatar')
    .sort({ helpful: -1, createdAt: -1 })
    .limit(10)
    .lean();

    game.recentReviews = reviews;

    res.json({ game });
  } catch (error) {
    console.error('Get game by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/games
// @desc    Create a new game
// @access  Private (Admin/Developer)
router.post('/', [
  auth,
  developerAuth,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('shortDescription').notEmpty().withMessage('Short description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('developer').notEmpty().withMessage('Developer is required'),
  body('publisher').notEmpty().withMessage('Publisher is required'),
  body('releaseDate').isISO8601().withMessage('Valid release date is required'),
  body('headerImage').isURL().withMessage('Valid header image URL is required'),
  body('capsuleImage').isURL().withMessage('Valid capsule image URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const game = new Game(req.body);
    await game.save();

    res.status(201).json({ 
      message: 'Game created successfully', 
      game 
    });
  } catch (error) {
    console.error('Create game error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Game with this title already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/games/:id
// @desc    Update a game
// @access  Private (Admin/Editor)
router.put('/:id', [
  auth,
  editorAuth,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('headerImage').optional().isURL().withMessage('Valid header image URL is required'),
  body('capsuleImage').optional().isURL().withMessage('Valid capsule image URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const game = await Game.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json({ 
      message: 'Game updated successfully', 
      game 
    });
  } catch (error) {
    console.error('Update game error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid game ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/games/:id
// @desc    Delete a game (soft delete)
// @access  Private (Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid game ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;