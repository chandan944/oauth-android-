export const API_BASE_URL = 'http://192.168.43.112:8080';

export const ENDPOINTS = {

  // Diaries
  DIARIES: '/api/diaries',
  MY_DIARIES: '/api/diaries/me',
  PUBLIC_DIARIES: '/api/diaries/public',
  
  // Messages
  MESSAGES: '/api',
  MESSAGE_COMMENTS: (id) => `/api/${id}/comments`,
  ADMIN_MESSAGES: '/api/admin',
  
  // Habits
  HABITS: '/api/habits',
  MY_HABITS: '/api/habits/me',
  HABIT_LOG: '/api/habits/log',
  HABIT_DASHBOARD: '/api/habits/dashboard',
  HABIT_LOGS: (id) => `/api/habits/${id}/logs`,
  
  // Goals
  GOALS: '/api/goals',
  MY_GOALS: '/api/goals/me',
  GOAL_PROGRESS: '/api/goals/progress',
  GOAL_DASHBOARD: '/api/goals/dashboard',
  GOAL_PROGRESS_HISTORY: (id) => `/api/goals/${id}/progress`,
};