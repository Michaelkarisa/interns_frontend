// src/utils/axios.js
import axios from "axios";
const APP_URL= "http://localhost:8000/";
const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
