import API from '../utils/api';

const submitFeedback = async (feedbackData) => {
    const response = await API.post('/api/feedback', feedbackData);
    return response.data;
};

const feedbackService = {
    submitFeedback,
};

export default feedbackService;