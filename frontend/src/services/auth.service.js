import axiosClient from "../api/axiosClient";

const authService = {
    login: async (email, password) => {
        const response = await axiosClient.post("/auth/signin", { email, password });
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await axiosClient.post("/auth/signup", userData);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    },

    getProfile: async () => {
        const response = await axiosClient.get("/auth/profile");
        return response.data;
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
}

export default authService;