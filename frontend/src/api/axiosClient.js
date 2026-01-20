import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

const axiosClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status === 401) {
            console.warn("Token expired or invalid");
            localStorage.removeItem("user");
            // Optional: Redirect to login or handle session expiry
            // window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
