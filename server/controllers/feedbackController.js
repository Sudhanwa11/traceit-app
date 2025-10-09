// server/controllers/feedbackController.js
const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
    const { name, email, message, branch } = req.body;
    try {
        const newFeedback = new Feedback({
            user: req.user.id,
            name,
            email,
            message,
            branch,
        });
        await newFeedback.save();
        res.status(201).json({ msg: 'Feedback submitted successfully. Thank you!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};