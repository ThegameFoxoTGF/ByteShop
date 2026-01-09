import axiosClient from "../api/axiosClient";

const couponService = {
    checkCoupon: async (data) => {
        const response = await axiosClient.post("/coupon/check", data);
        return response.data;
    },
    // Admin
    getCoupons: async () => {
        const response = await axiosClient.get("/coupon");
        return response.data;
    },
    getCouponById: async (id) => {
        const response = await axiosClient.get(`/coupon/${id}`);
        return response.data;
    },
    createCoupon: async (couponData) => {
        const response = await axiosClient.post("/coupon", couponData);
        return response.data;
    },
    updateCoupon: async (id, couponData) => {
        const response = await axiosClient.put(`/coupon/${id}`, couponData);
        return response.data;
    },
    deleteCoupon: async (id) => {
        const response = await axiosClient.delete(`/coupon/${id}`);
        return response.data;
    },
};

export default couponService;
