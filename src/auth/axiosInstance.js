import axios from 'axios';

const BASE_URL = 'https://api.wise-player.com';

const apiService = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    if (error.response?.status === 401) {

      // logout user
      localStorage.clear();

      // redirect to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiService;