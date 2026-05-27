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
  (error) => Promise.reject(error)
);

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ── FIX: don't redirect if this IS the login request ──
      // Without this, wrong credentials cause an instant redirect
      // before the component can show the error toast
      const isLoginRequest = error.config?.url?.includes('/api/reseller/login');
      if (!isLoginRequest) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiService;