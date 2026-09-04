import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('medistock_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('medistock_cart', JSON.stringify(cartItems));
        } catch (e) {
            console.error('Failed to save cart to localStorage', e);
        }
    }, [cartItems]);

    const addToCart = (medicine, quantity = 1) => {
        setCartItems((prevItems) => {
            const existingIndex = prevItems.findIndex((item) => item.medicineId === medicine.id);
            if (existingIndex > -1) {
                const updated = [...prevItems];
                const newQty = updated[existingIndex].quantity + quantity;
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: Math.min(newQty, medicine.stockQuantity)
                };
                return updated;
            } else {
                return [
                    ...prevItems,
                    {
                        medicineId: medicine.id,
                        name: medicine.name,
                        price: medicine.price,
                        categoryName: medicine.categoryName,
                        stockQuantity: medicine.stockQuantity,
                        requiresPrescription: medicine.requiresPrescription,
                        quantity: Math.min(quantity, medicine.stockQuantity)
                    }
                ];
            }
        });
    };

    const updateQuantity = (medicineId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(medicineId);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item.medicineId === medicineId) {
                    return {
                        ...item,
                        quantity: Math.min(newQuantity, item.stockQuantity)
                    };
                }
                return item;
            })
        );
    };

    const removeFromCart = (medicineId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.medicineId !== medicineId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const hasPrescriptionRequiredItems = () => {
        return cartItems.some((item) => item.requiresPrescription);
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                hasPrescriptionRequiredItems,
                cartTotal,
                cartCount
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
