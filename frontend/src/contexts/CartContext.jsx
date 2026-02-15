import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cart.service';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  const fetchCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const data = await cartService.getCart();

      if (!data || !data.items) {
        setCartCount(0);
        return;
      }
      const count = data.items.length;
      setCartCount(count);
    } catch (error) {
      console.error("Error fetching cart count", error);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user]);
  const updateCartCount = (count) => {
    setCartCount(count);
  };

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);