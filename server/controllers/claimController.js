// server/controllers/claimController.js
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');

// Create a new claim for an item
exports.createClaim = async (req, res) => {
    const { proof } = req.body;
    try {
        const item = await Item.findById(req.params.itemId);
        if (!item) {
            return res.status(404).json({ msg: 'Item not found' });
        }
        if (item.reportedBy.toString() === req.user.id) {
            return res.status(400).json({ msg: 'You cannot claim an item you reported.' });
        }

        const newClaim = new Claim({
            item: req.params.itemId,
            claimer: req.user.id,
            itemReporter: item.reportedBy,
            proof,
        });

        const claim = await newClaim.save();
        res.status(201).json(claim);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all claims on items reported by the logged-in user
exports.getReceivedClaims = async (req, res) => {
    try {
        const claims = await Claim.find({ itemReporter: req.user.id })
            .populate('item', 'itemName media')
            .populate('claimer', 'name department');
        res.json(claims);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Respond to a claim (approve or reject)
exports.respondToClaim = async (req, res) => {
    const { response } = req.body; // 'approve' or 'reject'
    try {
        const claim = await Claim.findById(req.params.claimId);
        if (!claim) {
            return res.status(404).json({ msg: 'Claim not found' });
        }
        if (claim.itemReporter.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized to respond to this claim' });
        }

        // Update claim status
        claim.status = response === 'approve' ? 'approved' : 'rejected';
        await claim.save();

        // If approved, update the item and award points
        if (claim.status === 'approved') {
            const item = await Item.findById(claim.item);
            item.isRetrieved = true;
            await item.save();

            // Award 100 service points to the user who reported the item
            await User.findByIdAndUpdate(claim.itemReporter, { $inc: { servicePoints: 100 } });
        }

        res.json(claim);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};