import axiosClient from "../api/axiosClient";

const cartService = {
    getCart: async () => {
        const response = await axiosClient.get("/cart");
        return response.data;
    },
    addToCart: async (productId, quantity, options) => {
        const response = await axiosClient.post("/cart", { productId, quantity, options });
        if (response.data.message) {
            // If backend returns a message (e.g. partial add), let the caller know or toast here?
            // Caller handles success toast, but maybe we should return it clearly.
        }
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
