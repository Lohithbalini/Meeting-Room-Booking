const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const TOKEN_KEY = "mrb_token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const authToken = token ?? getStoredToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (_error) {
    throw new Error("Unable to reach the server. Please try again.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Request failed.");
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export const api = {
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload }),
  me: () => apiRequest("/auth/me"),
  rooms: () => apiRequest("/rooms"),
  room: (roomId) => apiRequest(`/rooms/${roomId}`),
  roomBookings: (roomId, date) => apiRequest(`/rooms/${roomId}/bookings?date=${date}`),
  createBooking: (payload) => apiRequest("/bookings", { method: "POST", body: payload }),
  myBookings: () => apiRequest("/bookings/my"),
  cancelBooking: (bookingId) => apiRequest(`/bookings/${bookingId}`, { method: "DELETE" }),
};
