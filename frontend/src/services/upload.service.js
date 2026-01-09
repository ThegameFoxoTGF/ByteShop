import axiosClient from "../api/axiosClient";

const uploadService = {
    uploadImage: async (formData) => {
        const response = await axiosClient.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    deleteImage: async (key) => {
        const response = await axiosClient.post("/upload/delete", { key });
        return response.data;
    },
};

export default uploadService;
