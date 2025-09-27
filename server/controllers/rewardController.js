// server/controllers/rewardController.js
const User = require('../models/User');
const RewardClaim = require('../models/RewardClaim');

const REWARD_COST = 500;
const REWARD_NAME = "Custom 'Service Honour' Shirt";

exports.claimReward = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // 1. Check if the user has enough points
        if (user.servicePoints < REWARD_COST) {
            return res.status(400).json({ msg: 'Not enough points to claim this reward.' });
        }

        // 2. Deduct the points and save the user
        user.servicePoints -= REWARD_COST;
        await user.save();

        // 3. Create a record of the reward claim
        const newRewardClaim = new RewardClaim({
            user: req.user.id,
            rewardName: REWARD_NAME,
            pointsSpent: REWARD_COST,
        });
        await newRewardClaim.save();

        res.json({ msg: 'Reward claimed successfully!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};