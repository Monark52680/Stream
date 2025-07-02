import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import { Game } from '../types';

interface HeroSectionProps {
  games: Game[];
  onAddToCart: (game: Game) => void;
}

export default function HeroSection({ games, onAddToCart }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % games.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [games.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % games.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + games.length) % games.length);
  };

  const currentGame = games[currentSlide];

  if (!currentGame) return null;

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0">
        <img
          src={currentGame.headerImage}
          alt={currentGame.title}
          className="w-full h-full object-cover transition-all duration-1000 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gaming-darker via-transparent to-transparent" />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-10"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-10"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl animate-slide-up">
          {/* Badge */}
          <div className="flex items-center space-x-4 mb-4">
            <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </span>
            {currentGame.discount && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{currentGame.discount}% OFF
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
            {currentGame.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(currentGame.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
            <span className="text-white font-medium">
              {currentGame.rating.toFixed(1)} ({currentGame.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          {/* Description */}
          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            {currentGame.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {currentGame.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="bg-white/20 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onAddToCart(currentGame)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>
                {currentGame.price === 0 ? 'Play Now' : `Buy Now - $${currentGame.price.toFixed(2)}`}
              </span>
            </button>
            
            <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors duration-200 backdrop-blur-sm flex items-center justify-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Watch Trailer</span>
            </button>
          </div>

          {/* Price Info */}
          {currentGame.originalPrice && (
            <div className="flex items-center space-x-3 mt-4">
              <span className="text-gray-400 line-through text-lg">
                ${currentGame.originalPrice.toFixed(2)}
              </span>
              <span className="text-primary-400 font-bold text-xl">
                ${currentGame.price.toFixed(2)}
              </span>
              <span className="bg-primary-500 text-white px-2 py-1 rounded text-sm font-bold">
                Save ${(currentGame.originalPrice - currentGame.price).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {games.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? 'bg-primary-500' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </section>
  );
}