/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface CartItem {
  id: string; // ID del producto
  nombre: string;
  precio: number;
  cantidad: number;
  unidad_minima: number;
  stock_disponible: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('vinz_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('vinz_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === newItem.id);
      if (existingItem) {
        // Asegurar que no sobrepase el stock al sumar (opcional en frontend, se valida en backend)
        const nuevaCant = existingItem.cantidad + newItem.unidad_minima;
        if (nuevaCant > existingItem.stock_disponible) return prevItems;

        return prevItems.map((i) =>
          i.id === newItem.id ? { ...i, cantidad: nuevaCant } : i
        );
      }
      return [...prevItems, { ...newItem, cantidad: newItem.unidad_minima }];
    });
    // Abrir el carrito automáticamente al agregar algo
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, cantidad: number) => {
    setItems((prevItems) =>
      prevItems.map((i) => {
        if (i.id === id) {
          // Validar límites
          let newQty = cantidad;
          if (newQty < i.unidad_minima) newQty = i.unidad_minima;
          if (newQty > i.stock_disponible) newQty = i.stock_disponible;
          // Validar que sea múltiplo de la unidad mínima
          if (newQty % i.unidad_minima !== 0) {
            newQty = Math.floor(newQty / i.unidad_minima) * i.unidad_minima;
          }
          return { ...i, cantidad: newQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
