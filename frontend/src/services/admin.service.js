import axiosClient from "../api/axiosClient";

const adminService = {
    getDashboardStats: async (range = '7d') => {
        const response = await axiosClient.get(`/admin/dashboard?range=${range}`);
        return response.data;
    },
    getSalesChart: async (range) => {
        const response = await axiosClient.get(`/admin/sales-chart?range=${range}`);
        return response.data;
    },
};

export default adminService;
