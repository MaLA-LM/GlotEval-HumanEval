import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // or "http://127.0.0.1:5000"
  withCredentials: true,            // if you are using session cookies
});

export default api;
