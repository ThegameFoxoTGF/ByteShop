import axiosClient from "../api/axiosClient";

const productService = {
    getAllProducts: async () => {
        const response = await axiosClient.get("/product");
        return response.data;
    },

    getProductById: async (id) => {
        const response = await axiosClient.get(`/product/${id}`);
        return response.data;
    },

    createProduct: async (productData) => {
        const response = await axiosClient.post("/product", productData);
        return response.data;
    },

    updateProduct: async (id, productData) => {
        const response = await axiosClient.put(`/product/${id}`, productData);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await axiosClient.delete(`/product/${id}`);
        return response.data;
    }
};

export default productService;
