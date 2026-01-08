import api from './api';

const API_URL = '/api/diaries';

// ============================================
// 📝 CREATE NEW DIARY
// ============================================
export const createDiary = async (diaryData) => {
  try {
    console.log('📤 Creating diary:', diaryData);
    const response = await api.post(API_URL, {
      title: diaryData.title,
      goodThings: diaryData.goodThings,
      badThings: diaryData.badThings ,
      mood: diaryData.mood,
      visibility: diaryData.visibility || 'PUBLIC',
    });
    console.log('✅ Diary created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating diary:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// 👤 GET MY DIARIES (PAGINATED)
// ============================================
export const getMyDiaries = async (page = 0, size = 10) => {
  try {
    console.log('📚 Fetching my diaries...');
    const response = await api.get(`${API_URL}/me`, {
      params: { page, size },
    });
    console.log('✅ My diaries loaded:', response.data?.content?.length || 0);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching my diaries:', error.message);
    throw error;
  }
};

// ============================================
// 🌍 GET PUBLIC DIARIES FEED (PAGINATED)
// ============================================
export const getPublicDiaries = async (page = 0, size = 10) => {
  try {
    console.log('📖 Loading public diaries...');
    const response = await api.get(`${API_URL}/public`, {
      params: { page, size },
    });
    console.log('✅ Public diaries loaded:', response.data?.content?.length || 0);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching public diaries:', error.message);
    throw error;
  }
};

// ============================================
// ✏️ UPDATE SPECIFIC DIARY BY ID
// ============================================
export const updateDiary = async (id, updateData) => {
  try {
    console.log('✏️ Updating diary:', id);
    const response = await api.put(`${API_URL}/${id}`, {
      title: updateData.title,
      goodThings: updateData.goodThings,
      badThings: updateData.badThings,
      mood: updateData.mood,
      visibility: updateData.visibility,
    });
    console.log('✅ Diary updated successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error updating diary:', error.message);
    throw error;
  }
};

// ============================================
// 🗑️ DELETE DIARY BY ID
// ============================================
export const deleteDiary = async (id) => {
  try {
    console.log('🗑️ Deleting diary:', id);
    await api.delete(`${API_URL}/${id}`);
    console.log('✅ Diary deleted successfully');
    return { success: true, message: 'Diary deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting diary:', error.message);
    throw error;
  }
};