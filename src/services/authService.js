// src/services/authService.js
import api from "./api";

const login = (credentials) => api.post("/auth/login", credentials);
const register = (data) => api.post("/auth/register", data);
const logout = () => {
  localStorage.removeItem("jwt");
};

export default { login, register, logout };
