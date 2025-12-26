import { createContext, useState, useEffect, useContext, Children } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const userData = await authService.getProfile();
                    setUser(userData);
                } catch (error) {
                    console.error("Auth check failed", error);
                    authService.logout();
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            setUser(data.user); // Assuming the response has a user object
            return { success: true, data };
        } catch (error) {
            console.error("Login failed", error);
            // Handle error properly, maybe return the error message
            const errorMessage = error.response?.data?.message || "Login failed";
            return { success: false, error: errorMessage };
        }
    }

    const register = async (userData) => {
        try {
            const data = await authService.register(userData);
            setUser(data.user);

            return { success: true, data };
        } catch (error) {
            console.error("Register failed", error);
             const errorMessage = error.response?.data?.message || "Register failed";
            return { success: false, error: errorMessage };
        }
    }

    const logout = () => {
        authService.logout();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            register, 
            logout,
            isAuthenticated: !!user,
            isAdmin: user?.role === "admin",
            isEmployee: user?.role === "employee",
            }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

