import axios from "axios";
import axiosClient from "../api/axiosClient";

const uploadService = {
    uploadImage: async (formData) => {
        // Use raw axios to avoid global Content-Type: application/json header
        // This allows the browser to correctly set multipart/form-data with boundary
        const response = await axios.post("http://localhost:5000/api/upload", formData, {
            withCredentials: true
        });
        return response.data;
    },
    deleteImage: async (key) => {
        const response = await axiosClient.post("/upload/delete", { key });
        return response.data;
    },
};

export default uploadService;
