// client/src/services/itemService.js
import axios from 'axios';

const API_URL = '/api/items';

// Get all publicly listed "Found" items
const getFoundItems = async () => {
    const response = await axios.get(`${API_URL}/found`);
    return response.data;
};

const reportItem = async (itemData) => {
    const response = await axios.post(API_URL, itemData);
    return response.data;
};

// Get all successfully retrieved items for the logged-in user
const getMyRetrievedItems = async () => {
    const response = await axios.get(`${API_URL}/my-retrieved`);
    return response.data;
};

// Get all items reported by the logged-in user
const getMyItems = async () => {
    const response = await axios.get(`${API_URL}/my-items`);
    return response.data;
};

// --- NEWLY ADDED FUNCTION ---
// Get a single item by its ID
const getItemById = async (itemId) => {
    const response = await axios.get(`${API_URL}/${itemId}`);
    return response.data;
};

// Find semantic matches for a lost item
const findMatches = async (itemId) => {
    const response = await axios.get(`${API_URL}/matches/${itemId}`);
    return response.data;
};

const createClaim = async (itemId, proofData) => {
    const response = await axios.post(`/api/claims/${itemId}`, proofData);
    return response.data;
};

// Get all claims received by the logged-in user
const getReceivedClaims = async () => {
    const response = await axios.get('/api/claims/received');
    return response.data;
};

// Respond to a claim (approve or reject)
const respondToClaim = async (claimId, responseData) => {
    const response = await axios.put(`/api/claims/${claimId}/respond`, responseData);
    return response.data;
};


const itemService = {
    getFoundItems,
    reportItem,
    getMyRetrievedItems,
    getMyItems,
    getItemById, // Added to export
    findMatches,
    createClaim,
    getReceivedClaims,
    respondToClaim
};

export default itemService;