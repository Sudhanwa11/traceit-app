// client/src/services/chatService.js
import API from '../utils/api';

// Get (or create) a conversation and its messages for a specific claim
const getConversationByClaim = async (claimId) => {
    const response = await API.get(`/api/chat/conversation/${claimId}`);
    return response.data;
};

// Post a new message to a conversation
const postMessage = async (messageData) => {
    const response = await API.post('/api/chat/messages', messageData);
    return response.data;
};

const chatService = {
    getConversationByClaim,
    postMessage,
};

export default chatService;