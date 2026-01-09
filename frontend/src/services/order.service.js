import axiosClient from "../api/axiosClient";

const orderService = {
    createOrder: async (orderData) => {
        const response = await axiosClient.post("/order", orderData);
        return response.data;
    },
    getAllOrders: async () => {
        const response = await axiosClient.get("/order");
        return response.data;
    },
    getByOrderId: async (id) => {
        const response = await axiosClient.get(`/order/${id}`);
        return response.data;
    },
    approveOrder: async (id) => {
        const response = await axiosClient.put(`/order/${id}/approve`);
        return response.data;
    },
    updateOrderToPaid: async (id) => {
        const response = await axiosClient.put(`/order/${id}/pay`);
        return response.data;
    },
};

export default orderService;
