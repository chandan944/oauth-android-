import api from './api';

const API_URL = '/api/diaries';

// ============================================
// 📝 CREATE NEW DIARY
// ============================================
export const createDiary = async (diaryData) => {
  try {
    const response = await api.post(API_URL, {
      title: diaryData.title,
      goodThings: diaryData.goodThings,
      badThings: diaryData.badThings,
      mood: diaryData.mood,
      visibility: diaryData.visibility || 'PUBLIC',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// 👤 GET MY DIARIES (PAGINATED)
// ============================================
export const getMyDiaries = async (page = 0, size = 10) => {
  try {
    const response = await api.get(`${API_URL}/me`, {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// 🌍 GET PUBLIC DIARIES FEED (PAGINATED)
// ============================================
export const getPublicDiaries = async (page = 0, size = 10) => {
  try {
    const response = await api.get(`${API_URL}/public`, {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ✏️ UPDATE SPECIFIC DIARY BY ID
// ============================================
export const updateDiary = async (id, updateData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, {
      title: updateData.title,
      goodThings: updateData.goodThings,
      badThings: updateData.badThings,
      mood: updateData.mood,
      visibility: updateData.visibility,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// 🗑️ DELETE DIARY BY ID
// ============================================
export const deleteDiary = async (id) => {
  try {
    await api.delete(`${API_URL}/${id}`);
    return { success: true, message: 'Diary deleted successfully' };
  } catch (error) {
    throw error;
  }
};
