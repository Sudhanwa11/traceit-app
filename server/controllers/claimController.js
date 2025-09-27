// server/controllers/claimController.js
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');

// Step 1: Claimer clicks "Claim Item". A claim is created, and reporter is notified.
exports.createClaim = async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId).populate('reportedBy');
        if (!item) return res.status(404).json({ msg: 'Item not found' });
        if (item.reportedBy._id.toString() === req.user.id) return res.status(400).json({ msg: 'You cannot claim an item you reported.' });

        // Check if a claim already exists
        const existingClaim = await Claim.findOne({ item: req.params.itemId, claimer: req.user.id });
        if (existingClaim) return res.status(400).json({ msg: 'You have already placed a claim on this item.' });

        const newClaim = new Claim({
            item: req.params.itemId,
            claimer: req.user.id,
            itemReporter: item.reportedBy._id,
        });
        await newClaim.save();

        // Notify the item reporter
        const reporterId = item.reportedBy._id.toString();
        const reporterSocket = req.onlineUsers.find(user => user.userId === reporterId);
        if (reporterSocket) {
            req.io.to(reporterSocket.socketId).emit("newNotification", {
                message: `You have a new claim request on: ${item.itemName}`
            });
        }
        res.status(201).json(newClaim);
    } catch (err) { res.status(500).send('Server Error'); }
};

// Step 2: Reporter accepts or rejects the chat request.
exports.respondToChatRequest = async (req, res) => {
    const { response } = req.body; // 'accept' or 'reject'
    try {
        const claim = await Claim.findById(req.params.claimId).populate('claimer');
        if (!claim || claim.itemReporter.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        claim.status = response === 'accept' ? 'chat-active' : 'chat-rejected';
        await claim.save();

        // Notify the claimer of the decision
        const claimerId = claim.claimer._id.toString();
        const claimerSocket = req.onlineUsers.find(user => user.userId === claimerId);
        if (claimerSocket) {
            const message = response === 'accept' ? 'Your chat request was accepted. You can now chat with the reporter.' : 'Your chat request was rejected.';
            req.io.to(claimerSocket.socketId).emit("newNotification", { message });
        }
        res.json(claim);
    } catch (err) { res.status(500).send('Server Error'); }
};

// Step 3: Reporter is satisfied and marks the claim as resolved.
exports.reporterResolveClaim = async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.claimId).populate('claimer');
        if (!claim || claim.itemReporter.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        claim.status = 'resolved-by-reporter';
        await claim.save();

        // Notify the claimer to confirm retrieval
        const claimerId = claim.claimer._id.toString();
        const claimerSocket = req.onlineUsers.find(user => user.userId === claimerId);
        if (claimerSocket) {
            req.io.to(claimerSocket.socketId).emit("newNotification", {
                message: "The item reporter has marked your claim as resolved! Please confirm you have received the item."
            });
        }
        res.json(claim);
    } catch (err) { res.status(500).send('Server Error'); }
};

// Step 4: Claimer confirms they have the item. Points are awarded.
exports.claimerConfirmRetrieval = async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.claimId);
        if (!claim || claim.claimer.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        if (claim.status !== 'resolved-by-reporter') {
            return res.status(400).json({ msg: 'This claim has not been resolved by the reporter yet.' });
        }
        claim.status = 'retrieval-confirmed';
        await claim.save();

        // Mark the original item as retrieved
        const item = await Item.findById(claim.item);
        item.isRetrieved = true;
        await item.save();

        // Award 100 service points to the reporter
        await User.findByIdAndUpdate(claim.itemReporter, { $inc: { servicePoints: 100 } });
        
        res.json(claim);
    } catch (err) { res.status(500).send('Server Error'); }
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

exports.getMadeClaims = async (req, res) => {
    try {
        const claims = await Claim.find({ claimer: req.user.id })
            .populate('item', 'itemName media')
            .populate('itemReporter', 'name');
        res.json(claims);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};