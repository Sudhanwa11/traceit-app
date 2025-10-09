// client/src/services/itemService.js
import API from '../utils/api';

/**
 * Items (public + mine)
 */
const getFoundItems = async () => {
  const { data } = await API.get('/api/items/found');
  return data;
};

const getMyItems = async () => {
  const { data } = await API.get('/api/items/my-items');
  return data;
};

const getMyRetrievedItems = async () => {
  const { data } = await API.get('/api/items/my-retrieved');
  return data;
};

const getItemById = async (itemId) => {
  const { data } = await API.get(`/api/items/${itemId}`);
  return data;
};

/**
 * Create / Report item
 * @param {Object} itemData
 * @param {'Found'|'Lost'} itemData.status
 * @param {string} itemData.itemName
 * @param {string} itemData.description
 * @param {string} itemData.mainCategory
 * @param {string} itemData.subCategory
 * @param {string} itemData.location
 * @param {string=} itemData.currentLocation
 * @param {string=} itemData.retrievalImportance
 * @param {string=} itemData.priceRange
 * @param {File[]=} itemData.mediaFiles
 */
const reportItem = async (itemData) => {
  const {
    status,
    itemName,
    description,
    mainCategory,
    subCategory,
    location,
    currentLocation,
    retrievalImportance,
    priceRange,
    mediaFiles,
  } = itemData;

  // If there are files, send multipart/form-data (Busboy expects field name "media")
  if (Array.isArray(mediaFiles) && mediaFiles.length > 0) {
    const fd = new FormData();
    fd.append('status', status);
    fd.append('itemName', itemName);
    fd.append('description', description);
    fd.append('mainCategory', mainCategory);
    fd.append('subCategory', subCategory);
    fd.append('location', location);
    if (currentLocation) fd.append('currentLocation', currentLocation);
    if (retrievalImportance) fd.append('retrievalImportance', retrievalImportance);
    if (priceRange) fd.append('priceRange', priceRange);

    for (const file of mediaFiles) {
      fd.append('media', file);
    }

    const { data } = await API.post('/api/items', fd); // Content-Type set automatically
    return data;
  }

  // Otherwise send JSON
  const { data } = await API.post('/api/items', {
    status,
    itemName,
    description,
    mainCategory,
    subCategory,
    location,
    currentLocation,
    retrievalImportance,
    priceRange,
  });
  return data;
};

/**
 * Vector matches for a LOST item
 */
const findMatches = async (itemId) => {
  const { data } = await API.get(`/api/items/matches/${itemId}`);
  return data;
};

/**
 * Delete item by id
 */
const deleteItem = async (itemId) => {
  const { data } = await API.delete(`/api/items/${itemId}`);
  return data;
};

/**
 * Claims
 */
const createClaim = async (itemId) => {
  const { data } = await API.post(`/api/claims/${itemId}`);
  return data;
};

const getReceivedClaims = async () => {
  const { data } = await API.get('/api/claims/received');
  return data;
};

const getMadeClaims = async () => {
  const { data } = await API.get('/api/claims/made');
  return data;
};

const respondToChatRequest = async (claimId, response) => {
  const { data } = await API.put(`/api/claims/${claimId}/respond-chat`, { response });
  return data;
};

const reporterResolveClaim = async (claimId) => {
  const { data } = await API.put(`/api/claims/${claimId}/resolve`);
  return data;
};

const claimerConfirmRetrieval = async (claimId) => {
  const { data } = await API.put(`/api/claims/${claimId}/confirm`);
  return data;
};

const itemService = {
  // items
  getFoundItems,
  getMyItems,
  getMyRetrievedItems,
  getItemById,
  reportItem,
  findMatches,
  deleteItem,

  // claims
  createClaim,
  getReceivedClaims,
  getMadeClaims,
  respondToChatRequest,
  reporterResolveClaim,
  claimerConfirmRetrieval,
};

export default itemService;
