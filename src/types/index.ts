export interface Game {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  description: string;
  shortDescription: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  tags: string[];
  categories: string[];
  screenshots: string[];
  headerImage: string;
  capsuleImage: string;
  rating: number;
  reviewCount: number;
  features: string[];
  systemRequirements: {
    minimum: {
      os: string;
      processor: string;
      memory: string;
      graphics: string;
      storage: string;
    };
    recommended: {
      os: string;
      processor: string;
      memory: string;
      graphics: string;
      storage: string;
    };
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  library: string[];
  wishlist: string[];
  reviews: Review[];
}

export interface Review {
  id: string;
  gameId: string;
  userId: string;
  username: string;
  rating: number;
  content: string;
  helpful: number;
  date: string;
  recommended: boolean;
}

export interface CartItem {
  gameId: string;
  game: Game;
  quantity: number;
}