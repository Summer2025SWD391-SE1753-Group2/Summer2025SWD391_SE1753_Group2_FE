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

// Utility function to check token status
export const checkTokenStatus = () => {
  const token = getCookie("access_token");
  const refreshToken = getCookie("refresh_token");
  const userInfo = getCookie("user_info");

  console.log("🔍 Token Status Check:", {
    accessToken: {
      exists: !!token,
      length: token ? token.length : 0,
      preview: token ? `${token.substring(0, 20)}...` : "None",
    },
    refreshToken: {
      exists: !!refreshToken,
      length: refreshToken ? refreshToken.length : 0,
    },
    userInfo: {
      exists: !!userInfo,
      length: userInfo ? userInfo.length : 0,
    },
  });

  return { token, refreshToken, userInfo };
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
    console.log(
      "🔍 API Request Debug:",
      "\n- URL:",
      config.url,
      "\n- Token exists:",
      !!token,
      "\n- Token length:",
      token ? token.length : 0,
      "\n- Token preview:",
      token ? `${token.substring(0, 20)}...` : "None"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "✅ Authorization header set:",
        `Bearer ${token.substring(0, 20)}...`
      );
    } else {
      console.log(
        "❌ No token found, request will be sent without Authorization header"
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor with token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      "✅ API Response Success:",
      response.config.url,
      response.status
    );
    return response;
  },
  async (error) => {
    console.error("❌ API Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔄 Attempting token refresh...");
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
            console.log("✅ Token refreshed successfully");

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          // Refresh failed, clear auth data and redirect
          deleteCookie("access_token");
          deleteCookie("refresh_token");
          deleteCookie("user_info");
          window.location.href = "/auth/login";
        }
      } else {
        console.log("❌ No refresh token available");
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
