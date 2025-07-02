import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg'
  },
  library: [{
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    price: Number
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }],
  profile: {
    bio: String,
    location: String,
    website: String,
    joinDate: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    favoriteGenres: [String],
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  loginHistory: [
    {
      timestamp: { type: Date, default: Date.now },
      ip: String,
      userAgent: String
    }
  ]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);