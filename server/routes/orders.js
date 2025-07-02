import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Game from '../models/Game.js';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', [
  auth,
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.gameId').isMongoId().withMessage('Valid game ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['credit_card', 'paypal', 'steam_wallet', 'gift_card']).withMessage('Invalid payment method'),
  body('billingAddress.firstName').notEmpty().withMessage('First name is required'),
  body('billingAddress.lastName').notEmpty().withMessage('Last name is required'),
  body('billingAddress.email').isEmail().withMessage('Valid email is required'),
  body('billingAddress.address1').notEmpty().withMessage('Address is required'),
  body('billingAddress.city').notEmpty().withMessage('City is required'),
  body('billingAddress.country').notEmpty().withMessage('Country is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { items, paymentMethod, billingAddress, couponCode } = req.body;

    // Validate games and get current prices
    const gameIds = items.map(item => item.gameId);
    const games = await Game.find({ 
      _id: { $in: gameIds }, 
      isActive: true 
    });

    if (games.length !== gameIds.length) {
      return res.status(400).json({ message: 'One or more games not found or inactive' });
    }

    // Check if user already owns any of these games
    const user = await User.findById(req.user._id);
    const ownedGames = items.filter(item => user.ownsGame(item.gameId));
    
    if (ownedGames.length > 0) {
      return res.status(400).json({ 
        message: 'You already own some of these games',
        ownedGames: ownedGames.map(item => item.gameId)
      });
    }

    // Build order items with current game data
    const orderItems = items.map(item => {
      const game = games.find(g => g._id.toString() === item.gameId);
      return {
        gameId: game._id,
        title: game.title,
        price: game.price,
        originalPrice: game.originalPrice,
        discount: game.discount,
        quantity: item.quantity
      };
    });

    // Create order
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      paymentMethod,
      billingAddress,
      couponCode
    });

    // Calculate totals
    order.calculateTotals();

    // TODO: Process payment here
    // For now, we'll simulate successful payment
    order.status = 'completed';
    order.paymentDetails = {
      transactionId: `txn_${Date.now()}`,
      paymentProcessor: paymentMethod,
      last4: '1234',
      cardType: 'visa'
    };

    await order.save();

    // Populate game data for response
    await order.populate('items.gameId', 'title capsuleImage');

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('items.gameId', 'title capsuleImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('items.gameId', 'title capsuleImage developer');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/refund
// @desc    Request refund for an order
// @access  Private
router.post('/:id/refund', [
  auth,
  body('reason').notEmpty().withMessage('Refund reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.canRefund()) {
      return res.status(400).json({ 
        message: 'This order is not eligible for refund' 
      });
    }

    // Update order with refund request
    order.refundRequested = true;
    order.refundReason = reason;
    order.refundRequestedAt = new Date();
    await order.save();

    // TODO: Send notification to admin/support team
    console.log(`Refund requested for order ${order.orderNumber}: ${reason}`);

    res.json({
      message: 'Refund request submitted successfully',
      order
    });
  } catch (error) {
    console.error('Request refund error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin only)
// @access  Private (Admin)
router.get('/admin/all', [
  auth,
  adminAuth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']).withMessage('Invalid status'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { page = 1, limit = 20, status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'billingAddress.email': { $regex: search, $options: 'i' } },
        { 'billingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'billingAddress.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'username email')
        .populate('items.gameId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', [
  auth,
  adminAuth,
  body('status').isIn(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']).withMessage('Invalid status'),
  body('note').optional().isString().withMessage('Note must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    order.status = status;
    
    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note
    });

    // Handle refund processing
    if (status === 'refunded' && order.refundRequested) {
      order.refundProcessedAt = new Date();
      order.refundAmount = order.total;
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/summary', [auth, adminAuth], async (req, res) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      refundedOrders,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'refunded' }),
      Order.find()
        .populate('userId', 'username')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      completedOrders,
      refundedOrders,
      recentOrders
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;