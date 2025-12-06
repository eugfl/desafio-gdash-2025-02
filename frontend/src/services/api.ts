import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token em todas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    // Transformar _id para id se existir
    if (response.data && response.data._id) {
      response.data.id = response.data._id;
      delete response.data._id;
    }

    // Se for um array, transformar cada item
    if (Array.isArray(response.data)) {
      response.data = response.data.map((item) => {
        if (item._id) {
          item.id = item._id;
          delete item._id;
        }
        return item;
      });
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
