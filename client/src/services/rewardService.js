// client/src/services/rewardService.js
import API from '../utils/api';

const claimReward = async () => {
    const response = await API.post('/api/rewards/claim');
    return response.data;
};

const rewardService = {
    claimReward,
};

export default rewardService;