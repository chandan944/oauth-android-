import api from './api';

export const sendGoogleTokenToBackend = async (authData) => {
  console.log('📤 Sending Google token to backend...');
  console.log('🔗 Backend URL:', api.defaults.baseURL + '/auth/google');
  console.log('👤 User:', authData?.email || 'No email');

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

    console.log('✅ Backend response status:', response.status);
    console.log('📥 Backend response data:', response.data);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Backend request failed');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    throw error;
  }
};