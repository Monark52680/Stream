import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import GameSection from './components/GameSection';
import Cart from './components/Cart';
import Footer from './components/Footer';
import { featuredGames, popularGames, newReleases } from './data/games';
import { Game, CartItem } from './types';
import LoginForm from './components/LoginForm';
import AdminPanel from './components/AdminPanel';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const addToCart = (game: Game) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.gameId === game.id);
      if (existingItem) {
        return prev.map(item =>
          item.gameId === game.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { gameId: game.id, game, quantity: 1 }];
    });
  };

  const addToWishlist = (game: Game) => {
    setWishlist(prev => {
      if (prev.includes(game.id)) {
        return prev.filter(id => id !== game.id);
      }
      return [...prev, game.id];
    });
  };

  const updateCartQuantity = (gameId: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.gameId !== gameId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.gameId === gameId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (gameId: string) => {
    setCartItems(prev => prev.filter(item => item.gameId !== gameId));
  };

  const handleCheckout = () => {
    alert('Checkout functionality would be implemented here!');
    setCartItems([]);
    setIsCartOpen(false);
  };

  const handleLoginSuccess = (user: any, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      // Validate token with backend
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Invalid session');
          return res.json();
        })
        .then(data => {
          setToken(storedToken);
          setUser(data.user);
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
    }
  }, []);

  useEffect(() => {
    function handleLogoutEvent() {
      handleLogout();
    }
    window.addEventListener('logout', handleLogoutEvent);
    return () => window.removeEventListener('logout', handleLogoutEvent);
  }, []);

  // UAC helpers
  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor' || user?.role === 'developer'; // treat developer as editor
  const isUser = user?.role === 'user';

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gaming-dark text-gaming-text">
        <Header 
          cartCount={cartCount} 
          onCartClick={() => setIsCartOpen(true)} 
          user={user}
        />
        <AdminPanel user={user} onLogout={handleLogout} />
      </div>
    );
  }

  if (!user || !token) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text">
      <Header 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)} 
        user={user}
      />
      
      <main>
        <HeroSection 
          games={featuredGames} 
          onAddToCart={addToCart} 
        />
        
        <GameSection
          title="Featured Games"
          games={featuredGames}
          onAddToCart={addToCart}
          onAddToWishlist={addToWishlist}
          wishlist={wishlist}
        />
        
        <GameSection
          title="Popular Right Now"
          games={popularGames}
          onAddToCart={addToCart}
          onAddToWishlist={addToWishlist}
          wishlist={wishlist}
        />
        
        <GameSection
          title="New Releases"
          games={newReleases}
          onAddToCart={addToCart}
          onAddToWishlist={addToWishlist}
          wishlist={wishlist}
        />
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <div>
        <header className="p-4 bg-gray-900 text-white flex justify-between items-center">
          <span className="font-bold">Welcome, {user.username}!</span>
          <div className="flex items-center gap-2">
            <span className="ml-4 px-2 py-1 rounded bg-blue-700 text-xs uppercase">{user.role}</span>
            <button
              className="ml-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>
        {/* Example UAC usage: */}
        {isAdmin && <div className="p-4 bg-red-100 text-red-800">Admin Panel: You have full access.</div>}
        {isEditor && !isAdmin && <div className="p-4 bg-yellow-100 text-yellow-800">Editor Panel: You can manage content.</div>}
        {isUser && <div className="p-4 bg-green-100 text-green-800">User Panel: Standard user access.</div>}
      </div>
    </div>
  );
}

export default App;