import axiosClient from "../api/axiosClient";

const categoryService = {
    getCategories: async (params = {}) => {
        const response = await axiosClient.get("/category", { params });
        return response.data;
    },
    getCategoryById: async (id) => {
        const response = await axiosClient.get(`/category/${id}`);
        return response.data;
    },

    // Admin
    createCategory: async (categoryData) => {
        const response = await axiosClient.post("/category", categoryData);
        return response.data;
    },
    updateCategory: async (id, categoryData) => {
        const response = await axiosClient.put(`/category/${id}`, categoryData);
        return response.data;
    },
    deleteCategory: async (id) => {
        const response = await axiosClient.delete(`/category/${id}`);
        return response.data;
    },
};

export default categoryService;
