import React from 'react';
import { Star, ShoppingCart, Heart, Plus } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onAddToCart: (game: Game) => void;
  onAddToWishlist: (game: Game) => void;
  isInWishlist?: boolean;
}

export default function GameCard({ game, onAddToCart, onAddToWishlist, isInWishlist = false }: GameCardProps) {
  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <div className="bg-gaming-card border border-gaming-border rounded-xl overflow-hidden hover:border-primary-500 transition-all duration-300 group animate-scale-in">
      {/* Game Image */}
      <div className="relative overflow-hidden">
        <img
          src={game.capsuleImage}
          alt={game.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount Badge */}
        {game.discount && (
          <div className="absolute top-3 left-3 bg-primary-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
            -{game.discount}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={() => onAddToWishlist(game)}
          className={`absolute top-3 right-3 p-2 rounded-lg transition-all duration-200 ${
            isInWishlist
              ? 'bg-red-500 text-white'
              : 'bg-black/50 text-white hover:bg-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onAddToCart(game)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-gaming-text font-semibold text-lg group-hover:text-primary-400 transition-colors duration-200 line-clamp-1">
            {game.title}
          </h3>
          <div className="flex items-center space-x-1 text-yellow-400">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{formatRating(game.rating)}</span>
          </div>
        </div>

        <p className="text-gaming-muted text-sm mb-3 line-clamp-2">
          {game.shortDescription}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-gaming-border text-gaming-text text-xs px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {game.originalPrice && (
              <span className="text-gaming-muted text-sm line-through">
                ${game.originalPrice.toFixed(2)}
              </span>
            )}
            <span className={`font-bold text-lg ${game.discount ? 'text-primary-400' : 'text-gaming-text'}`}>
              {formatPrice(game.price)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(game)}
            className="bg-gaming-border hover:bg-primary-500 text-gaming-text hover:text-white p-2 rounded-lg transition-all duration-200"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}