import axiosClient from "../api/axiosClient";

const productService = {
    getProducts: async (params) => {
        const response = await axiosClient.get("/product", { params });
        return response.data;
    },
    getProductById: async (id) => {
        const response = await axiosClient.get(`/product/${id}`);
        return response.data;
    },
    getProductBySlug: async (slug) => {
        const response = await axiosClient.get(`/product/slug/${slug}`);
        return response.data;
    },
    getProductBySku: async (sku) => {
        const response = await axiosClient.get(`/product/${sku}`);
        return response.data;
    },
    getCategoryFilters: async (categoryId, params = {}) => {
        const response = await axiosClient.get(`/product/filters/${categoryId}`, { params });
        return response.data;
    },

    getAllProducts: async (params) => {
        const response = await axiosClient.get("/product/all", { params });
        return response.data;
    },

    // Admin
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
    },
};

export default productService;
