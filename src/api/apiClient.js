// src/utils/axios.js
import axios from "axios";
const APP_URL= "http://68.178.207.103:8001/";
const api = axios.create({
  baseURL: "http://68.178.207.103:8001/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
