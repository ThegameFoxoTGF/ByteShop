import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    // Start with stored user data to show something immediately if needed
                    // But preferably validate or fetch fresh profile if token exists
                    // Assuming storedUser has token or similar. 
                    // authService.login stores the whole response in 'user' key.

                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);

                    // Optional: Verify token validity or fetch fresh profile
                    // const profile = await userService.getProfile();
                    // setUser(prev => ({ ...prev, ...profile })); 
                } catch (error) {
                    console.error("Failed to parse stored user or fetch profile", error);
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

    // Helper to check if user is authenticated
    const isAuthenticated = !!user;

    const value = {
        user,
        loading,
        login,
        register,
        logout,
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
