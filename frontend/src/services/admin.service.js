import axiosClient from "../api/axiosClient";

const adminService = {
    getDashboardStats: async () => {
        const response = await axiosClient.get("/admin/dashboard");
        return response.data;
    },
};

export default adminService;
