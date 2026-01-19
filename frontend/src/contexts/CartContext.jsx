import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cart.service';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth(); // ต้องรู้ว่าใครล็อกอิน ถึงจะไปดึงตะกร้าถูก

  // ฟังก์ชันดึงจำนวนสินค้าล่าสุดจาก Backend
  const fetchCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const data = await cartService.getCart(); // API getUserCart ของเรา

      if (!data || !data.items) {
        setCartCount(0);
        return;
      }
      // นับรวมจำนวนชิ้นทั้งหมด (quantity)
      const count = data.items.length;
      setCartCount(count);
    } catch (error) {
      console.error("Error fetching cart count", error);
    }
  };

  // ดึงข้อมูลเมื่อ User เปลี่ยน (Login/Logout) หรือโหลดหน้าเว็บ
  useEffect(() => {
    fetchCartCount();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);