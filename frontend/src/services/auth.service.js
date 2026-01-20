import axiosClient from "../api/axiosClient";

const authService = {
  // Login user
  login: async (email, password) => {
    const response = await axiosClient.post("/user/login", { email, password });
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  // Register user
  register: async (email, password) => {
    const response = await axiosClient.post("/user/register", {
      email,
      password,
    });
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    await axiosClient.post("/user/logout");
    localStorage.removeItem("user");
  },

  // Send OTP
  sendOtp: async (email) => {
    const response = await axiosClient.post("/user/otp", { email });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (email, otp, type = "register") => {
    const response = await axiosClient.post("/user/verify", { email, otp, type });
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await axiosClient.post("/user/forget", { email });
    return response.data;
  },

  // Reset Password
  resetPassword: async (email, passwordToken, newPassword) => {
    const response = await axiosClient.put("/user/forget-reset", {
      email,
      passwordToken,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
