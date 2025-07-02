import React from 'react';
import { ChevronRight } from 'lucide-react';
import GameCard from './GameCard';
import { Game } from '../types';

interface GameSectionProps {
  title: string;
  games: Game[];
  onAddToCart: (game: Game) => void;
  onAddToWishlist: (game: Game) => void;
  wishlist: string[];
}

export default function GameSection({ title, games, onAddToCart, onAddToWishlist, wishlist }: GameSectionProps) {
  return (
    <section className="py-16 bg-gaming-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gaming-text">{title}</h2>
          <button className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors duration-200 font-medium">
            <span>View All</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              isInWishlist={wishlist.includes(game.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}