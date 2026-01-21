import axiosClient from "../api/axiosClient";

const uploadService = {
    uploadImage: async (formData) => {
        const response = await axiosClient.post("/upload", formData);
        return response.data;
    },

    uploadSlip: async (formData) => {
        const response = await axiosClient.post("/upload/slip", formData);
        return response.data;
    },

    deleteImage: async (public_id) => {
        const response = await axiosClient.post("/upload/delete", { public_id });
        return response.data;
    },
};

export default uploadService;
