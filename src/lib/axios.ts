import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Cookie utilities
const getCookie = (name: string): string | null => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
};

const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/; SameSite=Strict; Secure=${
    location.protocol === "https:"
  }`;
};

const deleteCookie = (name: string) => {
  setCookie(name, "", -1);
};

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const refreshToken = getCookie("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${baseURL}/api/v1/auth/refresh-token`,
            {
              refresh_token: refreshToken,
            }
          );

          if (response.data.access_token) {
            setCookie("access_token", response.data.access_token, 1);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear auth data and redirect
          deleteCookie("access_token");
          deleteCookie("refresh_token");
          deleteCookie("user_info");
          window.location.href = "/auth/login";
          console.log(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        deleteCookie("access_token");
        deleteCookie("refresh_token");
        deleteCookie("user_info");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
