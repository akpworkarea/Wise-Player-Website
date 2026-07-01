import api from '../axiosInstance';

/**
 * Update profile fullName — role-aware.
 * RESELLER:     PUT /api/reseller/profile
 * SUB_RESELLER: PUT /api/sub-reseller/profile
 * body: { fullName }
 */
export const updateProfile = async (role, payload) => {
  try {
    const url = role === 'SUB_RESELLER'
      ? '/api/sub-reseller/profile'
      : '/api/reseller/profile';
    const response = await api.put(url, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update profile',
    };
  }
};

/**
 * Change password — role-aware.
 * RESELLER:     PUT /api/reseller/change-password
 * SUB_RESELLER: PUT /api/sub-reseller/change-password
 * body: { currentPassword, newPassword, confirmPassword }
 */
export const changePassword = async (role, currentPassword, newPassword, confirmPassword) => {
  try {
    const url = role === 'SUB_RESELLER'
      ? '/api/sub-reseller/change-password'
      : '/api/reseller/change-password';
    const response = await api.put(url, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to change password',
    };
  }
};