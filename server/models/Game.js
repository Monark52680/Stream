import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 200
  },
  developer: {
    type: String,
    required: true
  },
  publisher: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  categories: [{
    type: String,
    trim: true
  }],
  screenshots: [{
    type: String
  }],
  headerImage: {
    type: String,
    required: true
  },
  capsuleImage: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  features: [{
    type: String
  }],
  systemRequirements: {
    minimum: {
      os: String,
      processor: String,
      memory: String,
      graphics: String,
      storage: String
    },
    recommended: {
      os: String,
      processor: String,
      memory: String,
      graphics: String,
      storage: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalSales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
gameSchema.index({ title: 'text', description: 'text', tags: 'text' });
gameSchema.index({ tags: 1 });
gameSchema.index({ price: 1 });
gameSchema.index({ rating: -1 });
gameSchema.index({ releaseDate: -1 });

const Game = mongoose.model('Game', gameSchema);
export default Game;