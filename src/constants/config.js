export const API_BASE_URL = "https://self-help-4b9y.onrender.com";

export const ENDPOINTS = {
  // Diaries
  DIARIES: "/api/diaries",
  MY_DIARIES: "/api/diaries/me",
  PUBLIC_DIARIES: "/api/diaries/public",

  MESSAGES: "/api/messages", // GET all messages, GET /{id}
  ADMIN_MESSAGES: "/api/messages/admin", // POST, PUT /{id}, DELETE /{id}
  MESSAGE_COMMENTS: (messageId) => `/api/messages/${messageId}/comments`,

  // Habits
  HABITS: "/api/habits",
  MY_HABITS: "/api/habits/me",
  HABIT_LOG: "/api/habits/log",
  HABIT_DASHBOARD: "/api/habits/dashboard",
  HABIT_LOGS: (id) => `/api/habits/${id}/logs`,

  // Goals
  GOALS: "/api/goals",
  MY_GOALS: "/api/goals/me",
  GOAL_PROGRESS: "/api/goals/progress",
  GOAL_DASHBOARD: "/api/goals/dashboard",
  GOAL_PROGRESS_HISTORY: (id) => `/api/goals/${id}/progress`,
};
