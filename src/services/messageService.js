import api from './api';
import { ENDPOINTS } from '../constants/config';

// Get all messages
export const getAllMessages = async (page = 0, size = 10) => {
  const response = await api.get(ENDPOINTS.MESSAGES, {
    params: { page, size }
  });
  return response.data;
};

// Get single message
export const getMessage = async (id) => {
  const response = await api.get(`${ENDPOINTS.MESSAGES}/${id}`);
  return response.data;
};

// Create message (Admin only)
export const createMessage = async (messageData) => {
  const response = await api.post(ENDPOINTS.ADMIN_MESSAGES, messageData);
  return response.data;
};

// Update message (Admin only)
export const updateMessage = async (id, updateData) => {
  const response = await api.put(`${ENDPOINTS.ADMIN_MESSAGES}/${id}`, updateData);
  return response.data;
};

// Delete message (Admin only)
export const deleteMessage = async (id) => {
  const response = await api.delete(`${ENDPOINTS.ADMIN_MESSAGES}/${id}`);
  return response.data;
};

// Add comment
export const addComment = async (messageId, content) => {
  const response = await api.post(ENDPOINTS.MESSAGE_COMMENTS(messageId), { content });
  return response.data;
};

// Delete comment (Admin only)
export const deleteComment = async (messageId, commentId) => {
  const response = await api.delete(`${ENDPOINTS.ADMIN_MESSAGES}/${messageId}/comments/${commentId}`);
  return response.data;
};