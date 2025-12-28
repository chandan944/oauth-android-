import api from './api';
import { ENDPOINTS } from '../constants/config';

// Create habit
export const createHabit = async (habitData) => {
  const response = await api.post(ENDPOINTS.HABITS, habitData);
  return response.data;
};

// Get my habits
export const getMyHabits = async () => {
  const response = await api.get(ENDPOINTS.MY_HABITS);
  return response.data;
};

// Get single habit
export const getHabit = async (id) => {
  const response = await api.get(`${ENDPOINTS.HABITS}/${id}`);
  return response.data;
};

// Update habit
export const updateHabit = async (id, updateData) => {
  const response = await api.put(`${ENDPOINTS.HABITS}/${id}`, updateData);
  return response.data;
};

// Delete habit
export const deleteHabit = async (id) => {
  const response = await api.delete(`${ENDPOINTS.HABITS}/${id}`);
  return response.data;
};

// Log habit (today)
export const logHabit = async (logData) => {
  const response = await api.post(ENDPOINTS.HABIT_LOG, logData);
  return response.data;
};

// Get habit logs
export const getHabitLogs = async (habitId, days = 7) => {
  const response = await api.get(ENDPOINTS.HABIT_LOGS(habitId), {
    params: { days }
  });
  return response.data;
};

// Get habit dashboard
export const getHabitDashboard = async () => {
  const response = await api.get(ENDPOINTS.HABIT_DASHBOARD);
  return response.data;
};