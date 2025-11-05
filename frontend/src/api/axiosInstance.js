import axios from "axios";

// Use Vite env variable or fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // allows sending cookies (refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔄 Request interceptor → Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔁 Response interceptor → Handle expired/invalid token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const hasAccessToken = !!localStorage.getItem("accessToken");

    // If token expired and we haven't retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      hasAccessToken
    ) {
      originalRequest._retry = true;

      try {
        // Refresh access token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/v1/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.accessToken;

        if (newAccessToken) {
          // Save new token
          localStorage.setItem("accessToken", newAccessToken);

          // Update header for retried request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the failed request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed → logout user safely
        localStorage.removeItem("accessToken");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // For unauthenticated requests (no token) → just reject
    return Promise.reject(error);
  }
);

export default api;
