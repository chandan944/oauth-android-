// src/services/todoService.js
import api from './api';

const ENDPOINTS = {
  TODOS: '/api/todos',
  TODO_STATS: '/api/todos/stats',
};

// Get all todos
export const getAllTodos = async (page = 0, size = 20) => {
  const response = await api.get(ENDPOINTS.TODOS, {
    params: { page, size }
  });
  return response.data;
};

// Get todos by status (completed/pending)
export const getTodosByStatus = async (completed, page = 0, size = 20) => {
  const response = await api.get(`${ENDPOINTS.TODOS}/filter`, {
    params: { completed, page, size }
  });
  return response.data;
};

// Get single todo
export const getTodo = async (id) => {
  const response = await api.get(`${ENDPOINTS.TODOS}/${id}`);
  return response.data;
};

// Create todo
export const createTodo = async (todoData) => {
  const response = await api.post(ENDPOINTS.TODOS, todoData);
  return response.data;
};

// Update todo
export const updateTodo = async (id, todoData) => {
  const response = await api.put(`${ENDPOINTS.TODOS}/${id}`, todoData);
  return response.data;
};

// Toggle todo completion
export const toggleTodoComplete = async (id, actualMinutes = null) => {
  const response = await api.patch(`${ENDPOINTS.TODOS}/${id}/toggle`, 
    actualMinutes ? { actualMinutes } : {});
  return response.data;
};

// Delete todo
export const deleteTodo = async (id) => {
  const response = await api.delete(`${ENDPOINTS.TODOS}/${id}`);
  return response.data;
};

// Get todo statistics
export const getTodoStats = async () => {
  const response = await api.get(ENDPOINTS.TODO_STATS);
  return response.data;
};