import api from './api';

export const sendGoogleTokenToBackend = async (authData) => {

  // Validate authData
  if (!authData || !authData.email || !authData.idToken) {
    throw new Error('Invalid authentication data');
  }

  try {
    const response = await api.post('/auth/google', {
      idToken: authData.idToken,
      email: authData.email,
      name: authData.name,
      imageUrl: authData.imageUrl,
    });

    return response.data;
    
  } catch (error) {
    throw error;
  }
};
