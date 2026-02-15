import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth.service';
import userService from '../services/user.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);

                    try {
                        const profile = await userService.getProfile();
                        const updatedUser = { ...parsedUser, ...profile };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    } catch (err) {
                        console.error('Background profile fetch failed:', err);
                        // If token is invalid (401), logout
                        if (err.response && err.response.status === 401) {
                            localStorage.removeItem('user');
                            setUser(null);
                        }
                    }
                } catch (error) {
                    console.error("Failed to parse stored user", error);
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setUser(data);
        return data;
    };

    const register = async (email, password) => {
        const data = await authService.register(email, password);
        setUser(data);
        return data;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const is_admin = user?.is_admin === true;

    const isAuthenticated = !!user;

    const updateUser = (userData) => {
        setUser(prev => {
            const updated = { ...prev, ...userData };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    const toggleWishlist = async (productId) => {
        if (!user) return;

        const currentWishlist = user.wishlist || [];
        const isWished = currentWishlist.includes(productId);

        try {
            let res;
            if (isWished) {
                res = await userService.removeFromWishlist(productId);
            } else {
                res = await userService.addToWishlist(productId);
            }

            if (res.wishlist) {
                updateUser({ wishlist: res.wishlist });
            }
        } catch (error) {
            console.error("Wishlist toggle error", error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        toggleWishlist,
        isAuthenticated,
        is_admin
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
