import React from "react";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = '₹';
    const delivery_fee = 50;
    const backendUrl = import.meta.env.VITE_BACKEND_URL // Backend Url
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('')
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistLoaded, setWishlistLoaded] = useState(false);
    const navigate = useNavigate();
    const isAuthenticated = !!token;

    const getUserCart = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    // Wishlist logic

    const addToWishlist = async (itemId) => {
        const alreadyInWishlist = wishlistItems.some(item =>
            typeof item === 'string' ? item === itemId : item.productId === itemId
        );

        if (alreadyInWishlist) return;

        const updatedWishlist = [...wishlistItems, itemId];
        setWishlistItems(updatedWishlist);

        if (token) {
            try {
                const response = await axios.post(`${backendUrl}/api/wishlist/add`, { itemId }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.success && Array.isArray(response.data.wishlistData)) {
                    setWishlistItems(response.data.wishlistData);
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Remove from Wishlist
    const removeFromWishlist = async (itemId) => {
        if (token) {
            try {
                const res = await axios.post(`${backendUrl}/api/wishlist/remove`, { itemId }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.data.success && Array.isArray(res.data.wishlistData)) {
                    // Update state with updated product list from backend
                    setWishlistItems(res.data.wishlistData);
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            // Fallback for unauthenticated users (if you allow wishlist without login)
            const filteredWishlist = wishlistItems.filter(item =>
                typeof item === 'string' ? item !== itemId : item._id !== itemId
            );
            setWishlistItems(filteredWishlist);
        }
    };


    // Get Wishlist once after login
    const getUserWishlist = async (token) => {
        try {
            const response = await axios.post(`${backendUrl}/api/wishlist/get`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success && Array.isArray(response.data.wishlistData)) {
                setWishlistItems(response.data.wishlistData);
                setWishlistLoaded(true); // prevent duplicate loads
            }
        } catch (error) {
            console.error(error);
        }
    };


    const addToCart = async (itemId, size) => {
        if (!size) {
            toast.error('Select Product Size')
            return;
        }
        let cartData = structuredClone(cartItems)
        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/add', { itemId, size }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            } catch (error) {
                console.log(error);
                toast.error(error.message)
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);
        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            } catch (error) {
                console.log(error);
                toast.error(error.message)
            }
        }
    }

    const removeFromCart = async (itemId, size) => {
        const cartData = structuredClone(cartItems);

        if (cartData[itemId] && cartData[itemId][size] !== undefined) {
            delete cartData[itemId][size];

            // If no sizes left for this item, remove the item entirely
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }

            setCartItems(cartData);

            if (token) {
                try {
                    await axios.post(backendUrl + '/api/cart/remove', { itemId, size }, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to remove from cart");
                }
            }
        }
    };


    const getCartAmount = () => {
        let totalAmount = 0;

        for (const items in cartItems) {
            const itemInfo = products.find(product => product._id === items);
            if (!itemInfo) continue; // 🛡️ Skip if product not found

            for (const item in cartItems[items]) {
                const quantity = cartItems[items][item];
                if (typeof quantity === 'number' && quantity > 0) {
                    totalAmount += itemInfo.price * quantity;
                }
            }
        }

        return totalAmount;
    };


    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setProducts(response.data.products)
            }
            else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }


    useEffect(() => {
        getProductsData()
    }, [])

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    // Fetch cart and wishlist once when token is available
    useEffect(() => {
        if (token) {
            getUserCart(token);
            if (!wishlistLoaded) {
                getUserWishlist(token);
            }
        }
    }, [token, wishlistLoaded]);



    const value = {
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        addToCart,
        setCartItems,
        getCartCount,
        updateQuantity,
        removeFromCart,
        getCartAmount,
        navigate,
        backendUrl,
        token,
        setToken,
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        setWishlistItems,
        getUserWishlist,
        wishlistLoaded,
        isAuthenticated: !!token,
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;