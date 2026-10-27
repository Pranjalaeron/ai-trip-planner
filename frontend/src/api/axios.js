import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://ai-trip-planner-backend-p8yw.onrender.com/",
});

export default api;