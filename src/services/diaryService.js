import api from './api';
import { ENDPOINTS } from '../constants/config';

// Create diary
export const createDiary = async (diaryData) => {
  const response = await api.post(ENDPOINTS.DIARIES, diaryData);
  return response.data;
};

// Get my diaries
export const getMyDiaries = async (page = 0, size = 10) => {
  const response = await api.get(ENDPOINTS.MY_DIARIES, {
    params: { page, size }
  });
  return response.data;
};

// Get public diaries
export const getPublicDiaries = async (page = 0, size = 10) => {
  const response = await api.get(ENDPOINTS.PUBLIC_DIARIES, {
    params: { page, size }
  });
  return response.data;
};

// Update diary
export const updateDiary = async (id, updateData) => {
  const response = await api.put(`${ENDPOINTS.DIARIES}/${id}`, updateData);
  return response.data;
};

// Delete diary
export const deleteDiary = async (id) => {
  const response = await api.delete(`${ENDPOINTS.DIARIES}/${id}`);
  return response.data;
};