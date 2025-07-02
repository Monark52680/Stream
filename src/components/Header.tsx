import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Gamepad2 } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  user?: any;
}

export default function Header({ cartCount, onCartClick, user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const navigation = [
    { name: 'Store', href: '#' },
    { name: 'Library', href: '#' },
    { name: 'Community', href: '#' },
    { name: 'Support', href: '#' },
  ];

  return (
    <header className="bg-gaming-darker border-b border-gaming-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              STREAM
            </span>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gaming-text hover:text-primary-400 transition-colors duration-200 font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center max-w-md w-full mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gaming-muted h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full bg-gaming-card border border-gaming-border rounded-lg pl-10 pr-4 py-2 text-gaming-text placeholder-gaming-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gaming-text hover:text-primary-400 transition-colors duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {user && user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-8 w-8 rounded-full border-2 border-primary-500 object-cover bg-gray-200"
                  onError={e => (e.currentTarget.src = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg')}
                />
              )}
              <button 
                className="p-2 text-gaming-text hover:text-primary-400 transition-colors duration-200"
                onClick={() => setShowUserMenu((v) => !v)}
                aria-label="User menu"
              >
                <User className="h-6 w-6" />
              </button>
              {showUserMenu && (
                <div ref={userMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50 border border-gray-200 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-semibold">{user?.username || 'User'}</div>
                    <div className="text-xs text-gray-500">{user?.email || ''}</div>
                  </div>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-semibold"
                    onClick={() => {
                      setShowUserMenu(false);
                      window.dispatchEvent(new CustomEvent('logout'));
                    }}
                  >
                    Logout
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => {
                      setShowUserMenu(false);
                      alert('Profile page coming soon!');
                    }}
                  >
                    Profile (coming soon)
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gaming-text hover:text-primary-400 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gaming-border animate-fade-in">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gaming-muted h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games..."
                  className="w-full bg-gaming-card border border-gaming-border rounded-lg pl-10 pr-4 py-2 text-gaming-text placeholder-gaming-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gaming-text hover:text-primary-400 hover:bg-gaming-card rounded-lg transition-colors duration-200 font-medium"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}