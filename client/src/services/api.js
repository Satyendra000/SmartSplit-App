import axios from "axios";

// Create axios instance with base URL
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

// Expense API endpoints
export const expenseAPI = {
  // Get all expenses
  getAll: (params) => API.get("/expenses", { params }),

  // Get single expense
  getById: (id) => API.get(`/expenses/${id}`),

  // Create expense
  create: (data) => API.post("/expenses", data),

  // Update expense
  update: (id, data) => API.put(`/expenses/${id}`, data),

  // Delete expense
  delete: (id) => API.delete(`/expenses/${id}`),

  // Get statistics
  getStats: (params) => API.get("/expenses/stats", { params }),
};

// Group API endpoints
export const groupAPI = {
  // Get all groups
  getAll: () => API.get("/groups"),

  // Get single group
  getById: (id) => API.get(`/groups/${id}`),

  // Create group
  create: (data) => API.post("/groups", data),

  // Update group
  update: (id, data) => API.put(`/groups/${id}`, data),

  // Delete group
  delete: (id) => API.delete(`/groups/${id}`),

  // Add member
  addMember: (groupId, userId) =>
    API.post(`/groups/${groupId}/members`, { userId }),

  // Remove member
  removeMember: (groupId, userId) =>
    API.delete(`/groups/${groupId}/members/${userId}`),
};

// User API endpoints
export const userAPI = {
  // Search user by email
  searchByEmail: (email) => API.get("/users/search", { params: { email } }),

  // Get all users
  getAll: (search) => API.get("/users", { params: { search } }),

  // Get user by ID
  getById: (id) => API.get(`/users/${id}`),

  // Update user
  update: (id, data) => API.put(`/users/${id}`, data),
};

export default API;
