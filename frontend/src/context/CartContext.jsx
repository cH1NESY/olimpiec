import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [deliveryMethod, setDeliveryMethod] = useState('pickup') // 'pickup' or 'delivery'

  useEffect(() => {
    const savedCart = localStorage.getItem('olimpiec_cart')
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Migration for old cart items without uniqueId or selectedSize
        const migrated = parsed.map(item => {
          if (!item.uniqueId) {
             // For old items, assume no size was selected or we can't recover it easily
             // We'll generate an ID based on product ID
             return { ...item, uniqueId: `${item.id}`, selectedSize: null }
          }
          return item;
        });
        setCart(migrated)
      } catch (e) {
        console.error('Error loading cart from localStorage', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('olimpiec_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product, quantity = 1, size = null) => {
    setCart(prevCart => {
      const sizeId = size ? size.id : null;
      // Unique ID is product ID + size ID (if exists)
      // If size is null, it's just product ID
      const uniqueId = sizeId ? `${product.id}-${sizeId}` : `${product.id}`;
      
      const existingItem = prevCart.find(item => item.uniqueId === uniqueId)
      
      // Determine max stock
      let maxStock = 0;
      if (size) {
        maxStock = parseInt(size.pivot?.stock_quantity || 0);
      } else {
        maxStock = parseInt(product.stock_quantity || 0);
      }

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > maxStock) {
           alert(`Достигнут лимит товара. Доступно: ${maxStock} шт.`);
           return prevCart.map(item => 
             item.uniqueId === uniqueId 
               ? { ...item, quantity: maxStock }
               : item
           );
        }

        return prevCart.map(item =>
          item.uniqueId === uniqueId
            ? { ...item, quantity: newQuantity }
            : item
        )
      }
      
      if (quantity > maxStock) {
        alert(`Достигнут лимит товара. Доступно: ${maxStock} шт.`);
        quantity = maxStock;
      }
      
      return [...prevCart, { 
        ...product, 
        quantity, 
        selectedSize: size, 
        uniqueId,
        maxStock // Store maxStock for later checks in cart
      }]
    })
  }

  const removeFromCart = (uniqueId) => {
    setCart(prevCart => prevCart.filter(item => item.uniqueId !== uniqueId))
  }

  const updateQuantity = (uniqueId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(uniqueId)
      return
    }
    
    setCart(prevCart => {
      const item = prevCart.find(i => i.uniqueId === uniqueId);
      if (!item) return prevCart;

      // Check max stock if available in item (added in addToCart)
      // If not in item, we might rely on what we have, or fetch? 
      // Ideally we stored it.
      const maxStock = item.maxStock !== undefined ? item.maxStock : Infinity;
      
      if (quantity > maxStock) {
         alert(`Достигнут лимит товара. Доступно: ${maxStock} шт.`);
         return prevCart.map(i => i.uniqueId === uniqueId ? { ...i, quantity: maxStock } : i);
      }

      return prevCart.map(item =>
        item.uniqueId === uniqueId ? { ...item, quantity } : item
      )
    })
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        deliveryMethod,
        setDeliveryMethod
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
