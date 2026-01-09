import axiosClient from "../api/axiosClient";

const cartService = {
    getCart: async () => {
        const response = await axiosClient.get("/cart");
        return response.data;
    },
    addToCart: async (productId, quantity, options) => {
        const response = await axiosClient.post("/cart", { productId, quantity, options });
        return response.data;
    },
    updateCartItem: async (productId, quantity) => {
        const response = await axiosClient.put(`/cart/${productId}`, { quantity });
        return response.data;
    },
    removeFromCart: async (productId) => {
        const response = await axiosClient.delete(`/cart/${productId}`);
        return response.data;
    },
};

export default cartService;
