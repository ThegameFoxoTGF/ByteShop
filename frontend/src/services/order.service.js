import axiosClient from "../api/axiosClient";

const orderService = {
    createOrder: async (orderData) => {
        const response = await axiosClient.post("/order", orderData);
        return response.data;
    },
    getAllOrders: async (params = {}) => {
        const response = await axiosClient.get("/order", { params });
        return response.data;
    },
    getByOrderId: async (id) => {
        const response = await axiosClient.get(`/order/${id}`);
        return response.data;
    },
    updateOrderToPaid: async (id, data) => {
        const response = await axiosClient.put(`/order/${id}/pay`, data);
        return response.data;
    },
    updateOrderAddress: async (id, address) => {
        const response = await axiosClient.put(`/order/${id}/address`, { shipping_address: address });
        return response.data;
    },
    cancelOrder: async (id) => {
        const response = await axiosClient.put(`/order/${id}/cancel`);
        return response.data;
    },
    updateOrderStatus: async (id, status, extraData = {}) => {
        const response = await axiosClient.put(`/order/${id}/status`, { status, ...extraData });
        return response.data;
    },
    confirmReceived: async (id) => {
        const response = await axiosClient.put(`/order/${id}/received`);
        return response.data;
    },
};

export default orderService;
