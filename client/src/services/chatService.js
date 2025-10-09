// client/src/services/chatService.js
import api from '../utils/api'; // your axios instance with auth header

const getConversationByClaim = async (claimId) => {
  const { data } = await api.get(`/api/chat/conversation/${claimId}`);
  return data;
};

const postMessage = async ({ conversationId, text }) => {
  const { data } = await api.post('/api/chat/message', { conversationId, text });
  return data;
};

// NEW: multipart version for images
const postMessageWithFiles = async ({ conversationId, text, files }) => {
  const form = new FormData();
  form.append('conversationId', conversationId);
  if (text) form.append('text', text);

  if (files && files.length) {
    Array.from(files).forEach((f) => form.append('files', f));
  }

  const { data } = await api.post('/api/chat/message', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

const chatService = {
  getConversationByClaim,
  postMessage,
  postMessageWithFiles
};

export default chatService;
