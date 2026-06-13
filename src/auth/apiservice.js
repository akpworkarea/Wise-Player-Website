import api from './axiosInstance';

export const registerReseller = async (formData) => {
  try {
    const response = await api.post('/api/reseller/register', formData);

    // Store token from register response so verify-email call is authenticated
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed',
    };
  }
};

export const verifyOtp = async (otp) => {
  try {
    const response = await api.post('/api/reseller/verify-email', { otp });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error   ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'OTP verification failed',
    };
  }
};

export const loginReseller = async (credentials) => {
  try {
    const response = await api.post('/api/reseller/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
    }
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error   ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Invalid credentials',
    };
  }
};

export const generateDeviceKey = async (macAddress) => {
  try {
    const response = await api.post('/api/device/key', { deviceId: macAddress });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to generate activation key',
    };
  }
};

export const activateDeviceApi = async (deviceId, activationKey) => {
  try {
    const response = await api.post('/api/device/activate', { deviceId, activationKey });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Server connection failed',
    };
  }
};

export const validateDevice = async (fingerprint) => {
  try {
    const response = await api.post('/api/device/validate', { fingerprint });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Device validation failed',
      error: error.response?.data,
    };
  }
};

export const saveM3uPlaylist = async (macAddress, playlistData) => {
  try {
    if (!macAddress) return { success: false, message: 'MAC address is missing!' };
    const response = await api.post(
      `/api/playlist/public/${macAddress}/m3u`,
      { name: playlistData.name, m3uUrl: playlistData.m3uUrl }
    );
    return { success: true, message: response.data.message || 'Playlist saved!' };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.error   ||
        error.response?.data?.message ||
        'Failed to save playlist',
    };
  }
};

export const checkoutPayment = async ({ deviceId, planName, successUrl, cancelUrl }) => {
  try {
    const response = await api.post('/api/payment/public/checkout', {
      deviceId, planName, successUrl, cancelUrl,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Payment checkout failed',
    };
  }
};

export const fetchPublicPlans = async () => {
  try {
    const response = await api.get('/api/payment/public/plans');
    return response.data;
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
};

export const submitSupportTicket = async (ticketData) => {
  try {
    const formData = new FormData();
    formData.append('firstName',   ticketData.firstName);
    formData.append('lastName',    ticketData.lastName);
    formData.append('email',       ticketData.email);
    formData.append('macAddress',  ticketData.macAddress);
    formData.append('inquiryType', ticketData.inquiryType);
    formData.append('message',     ticketData.message);
    if (ticketData.attachment) formData.append('attachment', ticketData.attachment);
    const response = await api.post('/api/public/support/ticket', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit ticket',
    };
  }
};

export const downloadInvoicePdf = async (deviceId, invoiceNo) => {
  try {
    const response = await api.get(
      `/api/payment/public/invoice/${invoiceNo}/pdf`,
      { params: { deviceId, invoiceNo }, responseType: 'blob' }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: 'Download failed' };
  }
};