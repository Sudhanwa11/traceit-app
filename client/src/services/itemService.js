// client/src/services/itemService.js
import API from '../utils/api'; // Use the new central API instance

const getFoundItems = async () => {
    const response = await API.get('/api/items/found');
    return response.data;
};

const reportItem = async (itemData) => {
    const response = await API.post('/api/items', itemData);
    return response.data;
};

const getMyRetrievedItems = async () => {
    const response = await API.get('/api/items/my-retrieved');
    return response.data;
};

const getMyItems = async () => {
    const response = await API.get('/api/items/my-items');
    return response.data;
};

const getItemById = async (itemId) => {
    const response = await API.get(`/api/items/${itemId}`);
    return response.data;
};

const findMatches = async (itemId) => {
    const response = await API.get(`/api/items/matches/${itemId}`);
    return response.data;
};

const deleteItem = async (itemId) => {
    const response = await API.delete(`/api/items/${itemId}`);
    return response.data;
};

// --- Claim related functions ---
const createClaim = async (itemId) => {
    const response = await API.post(`/api/claims/${itemId}`);
    return response.data;
};

const getReceivedClaims = async () => {
    const response = await API.get('/api/claims/received');
    return response.data;
};

const getMadeClaims = async () => {
    const response = await API.get('/api/claims/made');
    return response.data;
};

const respondToChatRequest = async (claimId, response) => {
    const res = await API.put(`/api/claims/${claimId}/respond-chat`, { response });
    return res.data;
};

const reporterResolveClaim = async (claimId) => {
    const response = await API.put(`/api/claims/${claimId}/resolve`);
    return response.data;
};

const claimerConfirmRetrieval = async (claimId) => {
    const response = await API.put(`/api/claims/${claimId}/confirm`);
    return response.data;
};


const itemService = {
    getFoundItems,
    reportItem,
    getMyRetrievedItems,
    getMyItems,
    getItemById,
    findMatches,
    deleteItem,
    createClaim,
    getReceivedClaims,
    getMadeClaims,
    respondToChatRequest,
    reporterResolveClaim,
    claimerConfirmRetrieval,
};

export default itemService;