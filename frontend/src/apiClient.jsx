import axios from 'axios';

const client = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

// Añadir token al header de cada solicitud
client.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;