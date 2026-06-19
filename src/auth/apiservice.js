import api from './axiosInstance';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerReseller = async (formData) => {
  try {
    const response = await api.post('/api/reseller/register', formData);
    const data = response.data;

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed',
    };
  }
};

/**
 * Verify email OTP after registration.
 * POST /api/reseller/verify-email  body: { "otp": "499596" }
 */
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
        'OTP verification failed',
    };
  }
};

/**
 * KEY FIX:
 * The API returns { success: false, token: "..." } when email is unverified.
 * Previously this function always returned { success: true } — ignoring the
 * API's own success flag — so unverified users went straight to the dashboard.
 *
 * Now we pass response.data.success through directly so LoginPage can
 * distinguish: success=true → dashboard, success=false → /verify-otp.
 */
/**
 * Resend OTP to the user's registered email.
 * Uses the token stored from login (unverified) or register response.
 * POST /api/reseller/resend-otp  — no body needed, token in Authorization header
 */
export const resendOtp = async () => {
  try {
    const response = await api.post('/api/reseller/resend-otp');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error   ||
        'Failed to resend OTP',
    };
  }
};

export const loginReseller = async (credentials) => {
  try {
    const response = await api.post('/api/reseller/login', credentials);
    const data = response.data;

    // Always store the token if present — the OTP page needs it to call verify-email
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }

    // ✅ Pass data.success through — do NOT hardcode true
    return { success: data.success, data };
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

/**
 * Request a password reset email.
 * POST /api/reseller/forgot-password  body: { "email": "..." }
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/reseller/forgot-password', { email });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error   ||
        'Failed to send recovery email',
    };
  }
};

/**
 * Reset password using the token from the recovery email link.
 * POST /api/reseller/reset-password  body: { "token": "...", "newPassword": "..." }
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/api/reseller/reset-password', { token, newPassword });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error   ||
        'Failed to reset password',
    };
  }
};

// ─── Device ───────────────────────────────────────────────────────────────────

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

// ─── Playlist ─────────────────────────────────────────────────────────────────

export const saveM3uPlaylist = async (macAddress, playlistData) => {
  try {
    if (!macAddress) return { success: false, message: 'MAC address is missing!' };
    const response = await api.post(`/api/playlist/public/${macAddress}/m3u`, {
      name: playlistData.name, m3uUrl: playlistData.m3uUrl,
    });
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

// ─── Payment ──────────────────────────────────────────────────────────────────

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

// ─── Support ──────────────────────────────────────────────────────────────────

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