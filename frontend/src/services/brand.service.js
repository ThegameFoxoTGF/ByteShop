import axiosClient from "../api/axiosClient";

const brandService = {
    getBrands: async (params = {}) => {
        const response = await axiosClient.get("/brand", { params });
        return response.data;
    },
    getBrandById: async (id) => {
        const response = await axiosClient.get(`/brand/${id}`);
        return response.data;
    },

    // Admin
    createBrand: async (brandData) => {
        const response = await axiosClient.post("/brand", brandData);
        return response.data;
    },
    updateBrand: async (id, brandData) => {
        const response = await axiosClient.put(`/brand/${id}`, brandData);
        return response.data;
    },
    deleteBrand: async (id) => {
        const response = await axiosClient.delete(`/brand/${id}`);
        return response.data;
    },
};

export default brandService;
