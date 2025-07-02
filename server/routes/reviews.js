import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Game from '../models/Game.js';
import User from '../models/User.js';
import { auth, optionalAuth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reviews/game/:gameId
// @desc    Get reviews for a specific game
// @access  Public
router.get('/game/:gameId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['helpful', 'recent', 'rating']).withMessage('Invalid sort field'),
  query('filter').optional().isIn(['all', 'positive', 'negative']).withMessage('Invalid filter')
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
      limit = 10,
      sort = 'helpful',
      filter = 'all'
    } = req.query;

    // Build filter object
    const filterObj = { 
      gameId: req.params.gameId, 
      isVisible: true 
    };

    // Apply rating filter
    if (filter === 'positive') {
      filterObj.rating = { $gte: 4 };
    } else if (filter === 'negative') {
      filterObj.rating = { $lte: 2 };
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'helpful':
        sortObj = { helpful: -1, createdAt: -1 };
        break;
      case 'recent':
        sortObj = { createdAt: -1 };
        break;
      case 'rating':
        sortObj = { rating: -1, createdAt: -1 };
        break;
      default:
        sortObj = { helpful: -1, createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, totalCount, ratingStats] = await Promise.all([
      Review.find(filterObj)
        .populate('userId', 'username avatar')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments(filterObj),
      Review.aggregate([
        { $match: { gameId: req.params.gameId, isVisible: true } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Add user vote status if authenticated
    if (req.user) {
      for (const review of reviews) {
        const userVote = review.helpfulVotes.find(
          vote => vote.userId.toString() === req.user._id.toString()
        );
        review.userVote = userVote ? userVote.vote : null;
        review.canVote = !userVote;
      }
    }

    // Format rating statistics
    const ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    ratingStats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
    });

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      ratingDistribution,
      filters: {
        sort,
        filter
      }
    });
  } catch (error) {
    console.error('Get game reviews error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid game ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews by a specific user
// @access  Public
router.get('/user/:userId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, totalCount] = await Promise.all([
      Review.find({ 
        userId: req.params.userId, 
        isVisible: true 
      })
        .populate('gameId', 'title capsuleImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments({ 
        userId: req.params.userId, 
        isVisible: true 
      })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', [
  auth,
  body('gameId').isMongoId().withMessage('Valid game ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('content').isLength({ min: 10, max: 2000 }).withMessage('Review content must be between 10 and 2000 characters'),
  body('recommended').isBoolean().withMessage('Recommended must be a boolean'),
  body('playtime').optional().isInt({ min: 0 }).withMessage('Playtime must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { gameId, rating, title, content, recommended, playtime } = req.body;

    // Check if game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if user owns the game
    const user = await User.findById(req.user._id);
    const isVerifiedPurchase = user.ownsGame(gameId);

    // Check if user already reviewed this game
    const existingReview = await Review.findOne({
      gameId,
      userId: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this game' });
    }

    // Create review
    const review = new Review({
      gameId,
      userId: req.user._id,
      rating,
      title,
      content,
      recommended,
      playtime: playtime || 0,
      isVerifiedPurchase
    });

    await review.save();

    // Populate user data for response
    await review.populate('userId', 'username avatar');

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', [
  auth,
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('content').optional().isLength({ min: 10, max: 2000 }).withMessage('Review content must be between 10 and 2000 characters'),
  body('recommended').optional().isBoolean().withMessage('Recommended must be a boolean'),
  body('playtime').optional().isInt({ min: 0 }).withMessage('Playtime must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Update review
    const updateData = req.body;
    updateData.isEdited = true;
    updateData.editedAt = new Date();

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'username avatar');

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/vote
// @desc    Vote on a review (helpful/not helpful)
// @access  Private
router.post('/:id/vote', [
  auth,
  body('vote').isIn(['helpful', 'not_helpful']).withMessage('Vote must be helpful or not_helpful')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { vote } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is trying to vote on their own review
    if (review.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot vote on your own review' });
    }

    // Add vote
    const voteAdded = review.addVote(req.user._id, vote);

    if (!voteAdded) {
      return res.status(400).json({ message: 'You have already voted on this review' });
    }

    await review.save();

    res.json({
      message: 'Vote recorded successfully',
      helpful: review.helpful,
      notHelpful: review.notHelpful
    });
  } catch (error) {
    console.error('Vote on review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/report
// @desc    Report a review
// @access  Private
router.post('/:id/report', [
  auth,
  body('reason').notEmpty().withMessage('Report reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update report status
    review.isReported = true;
    review.reportCount += 1;
    await review.save();

    // TODO: Send notification to moderators
    console.log(`Review ${review._id} reported by user ${req.user._id}: ${req.body.reason}`);

    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    console.error('Report review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/reported
// @desc    Get reported reviews (Admin only)
// @access  Private (Admin)
router.get('/reported', [auth, adminAuth], async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, totalCount] = await Promise.all([
      Review.find({ isReported: true })
        .populate('userId', 'username avatar')
        .populate('gameId', 'title')
        .sort({ reportCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments({ isReported: true })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get reported reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id/moderate
// @desc    Moderate a review (Admin only)
// @access  Private (Admin)
router.put('/:id/moderate', [
  auth,
  adminAuth,
  body('action').isIn(['approve', 'hide']).withMessage('Action must be approve or hide'),
  body('moderatorNotes').optional().isLength({ max: 500 }).withMessage('Moderator notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { action, moderatorNotes } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        isVisible: action === 'approve',
        isReported: false,
        moderatorNotes
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      message: `Review ${action}d successfully`,
      review
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;