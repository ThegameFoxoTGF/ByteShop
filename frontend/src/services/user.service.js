import axiosClient from "../api/axiosClient";

const userService = {
    // User Profile
    getProfile: async () => {
        const response = await axiosClient.get("/user/profile");
        return response.data;
    },
    updateProfile: async (userData) => {
        const response = await axiosClient.put("/user/profile", userData);
        return response.data;
    },

    // Admin: Users Management
    getUsers: async () => {
        const response = await axiosClient.get("/user");
        return response.data;
    },
    getUserById: async (id) => {
        const response = await axiosClient.get(`/user/${id}`);
        return response.data;
    },
    updateUser: async (id, userData) => {
        const response = await axiosClient.put(`/user/${id}`, userData);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await axiosClient.delete(`/user/${id}`);
        return response.data;
    },

    // Shipping Address
    getShippingAddress: async () => {
        const response = await axiosClient.get("/user/address/shipping");
        return response.data;
    },
    addShippingAddress: async (addressData) => {
        const response = await axiosClient.post("/user/address/shipping", addressData);
        return response.data;
    },
    updateShippingAddress: async (id, addressData) => {
        const response = await axiosClient.put(`/user/address/shipping/${id}`, addressData);
        return response.data;
    },
    deleteShippingAddress: async (id) => {
        const response = await axiosClient.delete(`/user/address/shipping/${id}`);
        return response.data;
    },

    // Wishlist
    getWishlist: async () => {
        const response = await axiosClient.get("/user/wishlist");
        return response.data;
    },
    addToWishlist: async (productId) => {
        const response = await axiosClient.post(`/user/wishlist/${productId}`);
        return response.data;
    },
    removeFromWishlist: async (productId) => {
        const response = await axiosClient.delete(`/user/wishlist/${productId}`);
        return response.data;
    },
};

export default userService;
