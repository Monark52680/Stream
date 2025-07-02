import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative']
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'paypal', 'steam_wallet', 'gift_card']
  },
  paymentDetails: {
    transactionId: String,
    paymentProcessor: String,
    last4: String, // Last 4 digits of card
    cardType: String // visa, mastercard, etc.
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  downloadLinks: [{
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
    },
    downloadUrl: String,
    expiresAt: Date,
    downloadCount: {
      type: Number,
      default: 0
    },
    maxDownloads: {
      type: Number,
      default: 5
    }
  }],
  refundRequested: {
    type: Boolean,
    default: false
  },
  refundReason: String,
  refundRequestedAt: Date,
  refundProcessedAt: Date,
  refundAmount: Number,
  notes: String,
  isGift: {
    type: Boolean,
    default: false
  },
  giftRecipient: {
    email: String,
    message: String,
    deliveryDate: Date
  },
  couponCode: String,
  couponDiscount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'items.gameId': 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `STR-${timestamp.slice(-8)}-${random}`;
  }
  next();
});

// Add status to history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Add games to user library when order is completed
orderSchema.post('save', async function() {
  if (this.status === 'completed' && this.isModified('status')) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.userId);
      
      if (user) {
        // Add all games from this order to user's library
        for (const item of this.items) {
          user.addToLibrary(item.gameId);
        }
        await user.save();
        
        // Update game sales count
        const Game = mongoose.model('Game');
        for (const item of this.items) {
          await Game.findByIdAndUpdate(
            item.gameId,
            { $inc: { salesCount: item.quantity } }
          );
        }
      }
    } catch (error) {
      console.error('Error updating user library:', error);
    }
  }
});

// Calculate totals
orderSchema.methods.calculateTotals = function(taxRate = 0.08) {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.tax = this.subtotal * taxRate;
  this.total = this.subtotal + this.tax - (this.couponDiscount || 0);
};

// Check if order can be refunded
orderSchema.methods.canRefund = function() {
  const daysSincePurchase = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return this.status === 'completed' && daysSincePurchase <= 14 && !this.refundRequested;
};

// Get formatted order total
orderSchema.virtual('formattedTotal').get(function() {
  return `$${this.total.toFixed(2)}`;
});

// Get order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export default mongoose.model('Order', orderSchema);