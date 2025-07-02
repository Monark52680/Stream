const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Game = require('../models/Game');

// Load environment variables
dotenv.config();

// Sample games data
const gamesData = [
  {
    title: 'Cyberpunk Legends',
    price: 59.99,
    originalPrice: 79.99,
    description: 'Experience the ultimate cyberpunk adventure in a sprawling metropolis filled with neon lights, corporate espionage, and cutting-edge technology. Choose your path in this immersive RPG where every decision shapes the future.',
    shortDescription: 'An immersive cyberpunk RPG set in a neon-lit metropolis.',
    developer: 'NeonStorm Studios',
    publisher: 'Future Games Inc.',
    releaseDate: new Date('2024-03-15'),
    tags: ['RPG', 'Open World', 'Cyberpunk', 'Action'],
    categories: ['Single-player', 'Multi-player', 'Co-op'],
    platforms: ['Windows', 'Mac', 'Linux'],
    screenshots: [
      'https://images.pexels.com/photos/8728382/pexels-photo-8728382.jpeg',
      'https://images.pexels.com/photos/9072316/pexels-photo-9072316.jpeg',
      'https://images.pexels.com/photos/8728380/pexels-photo-8728380.jpeg'
    ],
    headerImage: 'https://images.pexels.com/photos/8728382/pexels-photo-8728382.jpeg',
    capsuleImage: 'https://images.pexels.com/photos/8728382/pexels-photo-8728382.jpeg',
    rating: 4.8,
    reviewCount: 15420,
    totalRating: 74016,
    features: ['HDR', 'Ray Tracing', '4K Ultra HD', 'Controller Support'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel i5-8400 / AMD Ryzen 5 2600',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GTX 1060 / AMD RX 580',
        storage: '50 GB available space'
      },
      recommended: {
        os: 'Windows 11 64-bit',
        processor: 'Intel i7-10700K / AMD Ryzen 7 3700X',
        memory: '16 GB RAM',
        graphics: 'NVIDIA RTX 3070 / AMD RX 6700 XT',
        storage: '50 GB SSD space'
      }
    },
    isFeatured: true,
    isPopular: true,
    salesCount: 250000
  },
  {
    title: 'Stellar Odyssey',
    price: 49.99,
    description: 'Embark on an epic space exploration journey across galaxies. Build your fleet, discover new worlds, and engage in tactical space combat in this stunning sci-fi strategy game.',
    shortDescription: 'Epic space exploration and strategy game.',
    developer: 'Cosmic Interactive',
    publisher: 'Galaxy Entertainment',
    releaseDate: new Date('2024-01-22'),
    tags: ['Strategy', 'Space', 'Exploration', 'Simulation'],
    categories: ['Single-player', 'Multi-player'],
    platforms: ['Windows', 'Mac'],
    screenshots: [
      'https://images.pexels.com/photos/23547/pexels-photo.jpg',
      'https://images.pexels.com/photos/586036/pexels-photo-586036.jpeg',
      'https://images.pexels.com/photos/23945/pexels-photo.jpg'
    ],
    headerImage: 'https://images.pexels.com/photos/23547/pexels-photo.jpg',
    capsuleImage: 'https://images.pexels.com/photos/23547/pexels-photo.jpg',
    rating: 4.6,
    reviewCount: 8930,
    totalRating: 41078,
    features: ['HDR', '4K Ultra HD', 'Steam Workshop', 'Cloud Save'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel i5-7400 / AMD Ryzen 5 1600',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GTX 1050 Ti / AMD RX 570',
        storage: '35 GB available space'
      },
      recommended: {
        os: 'Windows 11 64-bit',
        processor: 'Intel i7-9700K / AMD Ryzen 7 2700X',
        memory: '16 GB RAM',
        graphics: 'NVIDIA RTX 2070 / AMD RX 6600 XT',
        storage: '35 GB SSD space'
      }
    },
    isFeatured: true,
    salesCount: 180000
  },
  {
    title: 'Mystic Realms',
    price: 39.99,
    originalPrice: 59.99,
    description: 'Dive into a magical fantasy world filled with ancient mysteries, powerful spells, and legendary creatures. Master the arcane arts and forge your destiny in this enchanting adventure.',
    shortDescription: 'Magical fantasy adventure with spellcasting and exploration.',
    developer: 'Enchanted Studios',
    publisher: 'Magic Realm Publishing',
    releaseDate: new Date('2023-11-08'),
    tags: ['Fantasy', 'Magic', 'Adventure', 'RPG'],
    categories: ['Single-player', 'Co-op'],
    platforms: ['Windows', 'Mac', 'Linux'],
    screenshots: [
      'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg',
      'https://images.pexels.com/photos/1374295/pexels-photo-1374295.jpeg',
      'https://images.pexels.com/photos/1666101/pexels-photo-1666101.jpeg'
    ],
    headerImage: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg',
    capsuleImage: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg',
    rating: 4.7,
    reviewCount: 12750,
    totalRating: 59925,
    features: ['HDR', 'Controller Support', 'Steam Achievements', 'Trading Cards'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel i5-6600K / AMD Ryzen 5 1500X',
        memory: '6 GB RAM',
        graphics: 'NVIDIA GTX 1050 / AMD RX 560',
        storage: '25 GB available space'
      },
      recommended: {
        os: 'Windows 11 64-bit',
        processor: 'Intel i7-8700K / AMD Ryzen 5 3600',
        memory: '12 GB RAM',
        graphics: 'NVIDIA RTX 2060 / AMD RX 5700',
        storage: '25 GB SSD space'
      }
    },
    isFeatured: true,
    salesCount: 320000
  },
  {
    title: 'Apex Warriors',
    price: 0,
    description: 'Free-to-play battle royale with unique character abilities and fast-paced combat.',
    shortDescription: 'Free-to-play battle royale shooter.',
    developer: 'Combat Studios',
    publisher: 'Battle Games',
    releaseDate: new Date('2023-08-12'),
    tags: ['Battle Royale', 'Shooter', 'Free to Play', 'Multiplayer'],
    categories: ['Multi-player', 'Online PvP'],
    platforms: ['Windows', 'Mac'],
    screenshots: [
      'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg',
      'https://images.pexels.com/photos/3945320/pexels-photo-3945320.jpeg',
      'https://images.pexels.com/photos/3945311/pexels-photo-3945311.jpeg'
    ],
    headerImage: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg',
    capsuleImage: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg',
    rating: 4.4,
    reviewCount: 45230,
    totalRating: 199012,
    features: ['Online Multi-Player', 'Cross-Platform', 'Anti-Cheat', 'Voice Chat'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel i3-6100 / AMD FX-4350',
        memory: '6 GB RAM',
        graphics: 'NVIDIA GTX 960 / AMD R9 280',
        storage: '22 GB available space'
      },
      recommended: {
        os: 'Windows 11 64-bit',
        processor: 'Intel i5-3570K / AMD Ryzen 5 2600',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GTX 1660 / AMD RX 580',
        storage: '22 GB SSD space'
      }
    },
    isPopular: true,
    salesCount: 2500000
  },
  {
    title: 'Racing Thunder',
    price: 29.99,
    description: 'High-octane racing with realistic physics and stunning visuals.',
    shortDescription: 'Realistic racing simulation with stunning visuals.',
    developer: 'Speed Demons',
    publisher: 'Racing Pro',
    releaseDate: new Date('2024-02-14'),
    tags: ['Racing', 'Simulation', 'Sports', 'Driving'],
    categories: ['Single-player', 'Multi-player', 'Online'],
    platforms: ['Windows', 'Mac', 'Linux'],
    screenshots: [
      'https://images.pexels.com/photos/544542/pexels-photo-544542.jpeg',
      'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg',
      'https://images.pexels.com/photos/358479/pexels-photo-358479.jpeg'
    ],
    headerImage: 'https://images.pexels.com/photos/544542/pexels-photo-544542.jpeg',
    capsuleImage: 'https://images.pexels.com/photos/544542/pexels-photo-544542.jpeg',
    rating: 4.5,
    reviewCount: 7890,
    totalRating: 35505,
    features: ['HDR', 'Ray Tracing', 'Wheel Support', 'VR Compatible'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel i5-8400 / AMD Ryzen 5 2600',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GTX 1060 / AMD RX 580',
        storage: '30 GB available space'
      },
      recommended: {
        os: 'Windows 11 64-bit',
        processor: 'Intel i7-10700K / AMD Ryzen 7 3700X',
        memory: '16 GB RAM',
        graphics: 'NVIDIA RTX 3060 / AMD RX 6600',
        storage: '30 GB SSD space'
      }
    },
    isPopular: true,
    salesCount: 150000
  },
  {
    title: 'Zombie Apocalypse',
    price: 19.99,
    originalPrice: 39.99,
    description: 'Survive the zombie apocalypse in this intense horror survival game.',
    shortDescription: 'Intense zombie survival horror game.',
    developer: 'Horror Labs',
    publisher: 'Scary Games',
    releaseDate: new Date('2023-10-31'),
    tags: ['Horror', 'Survival', 'Zombies', 'Action'],
    categories: ['Single-player', 'Co-op', 'Online Co-op'],
    platforms: ['Windows', 'Mac'],
    screenshots: [
      'https://images.pexels.com/photos/3661189/pexels-photo-3661189.jpeg',
      'https://images.pexels.com/photos/3661188/pexels-photo-3661188.jpeg',
      'https://images.pexels.com/photos/2736220/pexels-photo-2736220.jpeg'
    ],
    headerImage: 'https://images.pexels.com/photos/3661189/pexels-photo-3661189.jpeg',
    capsuleImage: 'https://images.pexels.com/photos/3661189/pexels-photo-3661189.jpeg',
    rating: 4.3,
    reviewCount: 18560,
    totalRating: 79808,
    features: ['Controller Support', 'Steam Achievements', 'Co-op Campaign', 'Survival Mode'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel i5-4430 / AMD FX-6300',
        memory: '6 GB RAM',
        graphics: 'NVIDIA GTX 750 Ti / AMD R7 260X',
        storage: '20 GB available space'
      },
      recommended: {
        os: 'Windows 11 64-bit',
        processor: 'Intel i7-6700K / AMD Ryzen 5 1600',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GTX 1070 / AMD RX 580',
        storage: '20 GB SSD space'
      }
    },
    isPopular: true,
    salesCount: 450000
  },
  {
    title: 'Kingdom Builder',
    price: 34.99,
    description: 'Build and manage your medieval kingdom in this strategic city builder.',
    shortDescription: 'Medieval kingdom building and management game.',
    developer: 'Medieval Studios',
    publisher: 'Kingdom Games',
    releaseDate: new Date('2024-03-20'),
    tags: ['Strategy', 'City Builder', 'Medieval', 'Management'],
    categories: ['Single-player', 'Sandbox'],
    platforms: ['Windows', 'Mac', 'Linux'],
    screenshots: [
      'https://images.pexels.com/photos/161963/city-view-amsterdam-river-amstel-161963.jpeg',
      'https://images.pexels.com/photos/220444/pexels-photo-220444.jpeg',
      'https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg'
    ],
    headerImage: 'https://images.pexels.com/photos/161963/city-view-amsterdam-river-amstel-161963.jpeg',
    capsuleImage: 'https://images.pexels.com/photos/161963/city-view-amsterdam-river-amstel-161963.jpeg',
    rating: 4.2,
    reviewCount: 3240,
    totalRating: 13608,
    features: ['Steam Workshop', 'Cloud Save', 'Level Editor', 'Mod Support'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel i3-6100 / AMD Ryzen 3 1200',
        memory: '4 GB RAM',
        graphics: 'NVIDIA GTX 950 / AMD R9 370',
        storage: '15 GB available space'
      },
      recommended: {
        os: 'Windows 11 64-bit',
        processor: 'Intel i5-8400 / AMD Ryzen 5 2600',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GTX 1660 / AMD RX 580',
        storage: '15 GB SSD space'
      }
    },
    isNewRelease: true,
    salesCount: 75000
  },
  {
    title: 'Ninja Shadows',
    price: 24.99,
    description: 'Master the art of stealth and combat in feudal Japan.',
    shortDescription: 'Stealth action game set in feudal Japan.',
    developer: 'Shadow Games',
    publisher: 'Eastern Interactive',
    releaseDate: new Date('2024-03-18'),
    tags: ['Action', 'Stealth', 'Ninja', 'Japan'],
    categories: ['Single-player', 'Action'],
    platforms: ['Windows', 'Mac'],
    screenshots: [
      'https://images.pexels.com/photos/2847339/pexels-photo-2847339.jpeg',
      'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg',
      'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg'
    ],
    headerImage: 'https://images.pexels.com/photos/2847339/pexels-photo-2847339.jpeg',
    capsuleImage: 'https://images.pexels.com/photos/2847339/pexels-photo-2847339.jpeg',
    rating: 4.6,
    reviewCount: 5670,
    totalRating: 26082,
    features: ['Controller Support', 'Steam Achievements', 'Trading Cards', 'HDR'],
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel i5-6600K / AMD Ryzen 5 1600',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GTX 1050 Ti / AMD RX 570',
        storage: '18 GB available space'
      },
      recommended: {
        os: 'Windows 11 64-bit',
        processor: 'Intel i7-8700K / AMD Ryzen 7 2700X',
        memory: '12 GB RAM',
        graphics: 'NVIDIA RTX 2060 / AMD RX 5700',
        storage: '18 GB SSD space'
      }
    },
    isNewRelease: true,
    salesCount: 95000
  }
];

async function seedGames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stream-gaming');
    console.log('✅ Connected to MongoDB');

    // Clear existing games
    await Game.deleteMany({});
    console.log('🗑️  Cleared existing games');

    // Insert new games
    const games = await Game.insertMany(gamesData);
    console.log(`✅ Seeded ${games.length} games successfully`);

    // Display seeded games
    games.forEach(game => {
      console.log(`   - ${game.title} (${game.formattedPrice})`);
    });

    console.log('\n🎮 Game seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding games:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedGames();