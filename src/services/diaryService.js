import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ⚙️ Configuration
const API_BASE_URL = 'http://192.168.43.112:8080'; // Replace with your actual backend URL
const API_URL = `${API_BASE_URL}/api/diaries`;

// 🔧 Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ============================================
// 📝 CREATE OR UPDATE TODAY'S DIARY
// ============================================
// POST /api/diaries
// This endpoint automatically creates a new diary or updates today's existing entry
export const createOrUpdateDiary = async (diaryData) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.post(
      API_URL,
      {
        title: diaryData.title,
        goodThings: diaryData.goodThings,
        badThings: diaryData.badThings || '',
        mood: diaryData.mood,
        visibility: diaryData.visibility || 'PUBLIC',
      },
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating/updating diary:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// 📖 GET TODAY'S DIARY ENTRY
// ============================================
// GET /api/diaries/today
// Returns today's diary entry if it exists, null otherwise
export const getTodayDiary = async () => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.get(`${API_URL}/today`, { headers });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // No entry for today - this is normal, not an error
      return null;
    }
    console.error('❌ Error fetching today diary:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// 👤 GET MY DIARIES (PAGINATED)
// ============================================
// GET /api/diaries/me?page=0&size=10
// Returns paginated list of user's own diaries
export const getMyDiaries = async (page = 0, size = 10) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.get(`${API_URL}/me`, {
      params: { page, size },
      headers,
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching my diaries:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// 🌍 GET PUBLIC DIARIES FEED (PAGINATED)
// ============================================
// GET /api/diaries/public?page=0&size=10
// Returns paginated list of public diaries from all users
export const getPublicDiaries = async (page = 0, size = 10) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.get(`${API_URL}/public`, {
      params: { page, size },
      headers,
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching public diaries:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// ✏️ UPDATE SPECIFIC DIARY BY ID
// ============================================
// PUT /api/diaries/{id}
// Updates a specific diary entry (only if user is the author)
export const updateDiaryById = async (id, updateData) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.put(
      `${API_URL}/${id}`,
      {
        title: updateData.title,
        goodThings: updateData.goodThings,
        badThings: updateData.badThings,
        mood: updateData.mood,
        visibility: updateData.visibility,
      },
      { headers }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to update this diary');
    }
    console.error('❌ Error updating diary:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// 🗑️ DELETE DIARY BY ID
// ============================================
// DELETE /api/diaries/{id}
// Deletes a specific diary entry (only if user is the author)
export const deleteDiary = async (id) => {
  try {
    const headers = await getAuthHeaders();
    
    await axios.delete(`${API_URL}/${id}`, { headers });
    
    return { success: true, message: 'Diary deleted successfully' };
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to delete this diary');
    }
    if (error.response?.status === 404) {
      throw new Error('Diary not found');
    }
    console.error('❌ Error deleting diary:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// 📊 HELPER: Get Diary Statistics
// ============================================
// This is a client-side helper to calculate stats from diary data
export const getDiaryStats = (diaries) => {
  if (!diaries || diaries.length === 0) {
    return {
      totalEntries: 0,
      moodDistribution: {},
      currentStreak: 0,
    };
  }

  const moodDistribution = {};
  diaries.forEach((diary) => {
    const mood = diary.mood || 'NEUTRAL';
    moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
  });

  return {
    totalEntries: diaries.length,
    moodDistribution,
    currentStreak: calculateStreak(diaries),
  };
};

// Helper function to calculate consecutive days streak
const calculateStreak = (diaries) => {
  if (!diaries || diaries.length === 0) return 0;

  const sortedDiaries = [...diaries].sort(
    (a, b) => new Date(b.entryDate) - new Date(a.entryDate)
  );

  let streak = 1;
  for (let i = 0; i < sortedDiaries.length - 1; i++) {
    const currentDate = new Date(sortedDiaries[i].entryDate);
    const previousDate = new Date(sortedDiaries[i + 1].entryDate);
    const diffDays = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// ============================================
// 🔍 EXPORT ALL FUNCTIONS
// ============================================
export default {
  createOrUpdateDiary,
  getTodayDiary,
  getMyDiaries,
  getPublicDiaries,
  updateDiaryById,
  deleteDiary,
  getDiaryStats,
};