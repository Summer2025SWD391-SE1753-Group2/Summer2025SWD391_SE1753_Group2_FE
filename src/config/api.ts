export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const API_VERSION = "/api/v1";
export const API_BASE = `${API_BASE_URL}${API_VERSION}`;

// For development/testing
export const DEFAULT_API_BASE = "/api/v1";
