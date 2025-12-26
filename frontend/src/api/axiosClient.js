import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:5000/api", // Adjust if backend runs on different port
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to add token to requests
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status === 401) {
            console.warn("Token expired or invalid");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
