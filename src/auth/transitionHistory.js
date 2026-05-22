import axios from 'axios';
import api from './axiosInstance'; 
const token = localStorage.getItem("token");


export const TransitionHistoryData = async (pageNo) => {
  try {
    // ya jahan store kiya hai

    const response = await api.get(`/api/reseller/credits/transactions?page=${pageNo}&size=20`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return { success: true, data: response.data };

  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch dashboard data'
    };
  }
};