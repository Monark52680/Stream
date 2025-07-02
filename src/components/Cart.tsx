import React from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem, Game } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (gameId: string, quantity: number) => void;
  onRemoveItem: (gameId: string) => void;
  onCheckout: () => void;
}

export default function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.game.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gaming-darker border-l border-gaming-border z-50 animate-slide-up">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gaming-border">
            <h2 className="text-xl font-bold text-gaming-text">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-2 text-gaming-muted hover:text-gaming-text transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gaming-muted text-lg mb-4">Your cart is empty</p>
                <button
                  onClick={onClose}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.gameId} className="bg-gaming-card rounded-lg p-4 border border-gaming-border">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.game.capsuleImage}
                        alt={item.game.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gaming-text font-medium truncate">
                          {item.game.title}
                        </h3>
                        <p className="text-gaming-muted text-sm mt-1">
                          {item.game.developer}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onUpdateQuantity(item.gameId, Math.max(0, item.quantity - 1))}
                              className="p-1 text-gaming-muted hover:text-gaming-text transition-colors duration-200"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-gaming-text font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.gameId, item.quantity + 1)}
                              className="p-1 text-gaming-muted hover:text-gaming-text transition-colors duration-200"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-gaming-text font-bold">
                              ${(item.game.price * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => onRemoveItem(item.gameId)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout */}
          {items.length > 0 && (
            <div className="border-t border-gaming-border p-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gaming-muted">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gaming-muted">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gaming-text font-bold text-lg border-t border-gaming-border pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={onCheckout}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-bold transition-colors duration-200"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}