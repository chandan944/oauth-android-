import api from './api';
import { ENDPOINTS } from '../constants/config';

// Create goal
export const createGoal = async (goalData) => {
  const response = await api.post(ENDPOINTS.GOALS, goalData);
  return response.data;
};

// Get my goals
export const getMyGoals = async () => {
  const response = await api.get(ENDPOINTS.MY_GOALS);
  return response.data;
};

// Get single goal
export const getGoal = async (id) => {
  const response = await api.get(`${ENDPOINTS.GOALS}/${id}`);
  return response.data;
};

// Update goal
export const updateGoal = async (id, updateData) => {
  const response = await api.put(`${ENDPOINTS.GOALS}/${id}`, updateData);
  return response.data;
};

// Delete goal
export const deleteGoal = async (id) => {
  const response = await api.delete(`${ENDPOINTS.GOALS}/${id}`);
  return response.data;
};

// Log progress (today)
export const logProgress = async (progressData) => {
  const response = await api.post(ENDPOINTS.GOAL_PROGRESS, progressData);
  return response.data;
};

// Get progress history
export const getProgressHistory = async (goalId, days = 7) => {
  const response = await api.get(ENDPOINTS.GOAL_PROGRESS_HISTORY(goalId), {
    params: { days }
  });
  return response.data;
};

// Get goal dashboard
export const getGoalDashboard = async () => {
  const response = await api.get(ENDPOINTS.GOAL_DASHBOARD);
  return response.data;
};