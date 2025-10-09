// server/controllers/claimController.js
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');

// Small helper to accept either /:claimId or /:id in routes
function getClaimId(req) {
  return req.params.claimId || req.params.id;
}

/* -------------------------------------------------------
 * Step 1: Claimer clicks "Claim Item"
 * ----------------------------------------------------- */
exports.createClaim = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId).populate('reportedBy');
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    if (item.reportedBy._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot claim an item you reported.' });
    }

    // Prevent duplicate claims from same user for this item
    const existingClaim = await Claim.findOne({ item: req.params.itemId, claimer: req.user.id });
    if (existingClaim) {
      return res.status(400).json({ msg: 'You have already placed a claim on this item.' });
    }

    const newClaim = new Claim({
      item: req.params.itemId,
      claimer: req.user.id,
      itemReporter: item.reportedBy._id,
    });

    await newClaim.save();

    // Notify the item reporter (if online)
    const reporterId = item.reportedBy._id.toString();
    const reporterSocket = req.onlineUsers?.find(u => u.userId === reporterId);
    if (reporterSocket) {
      req.io.to(reporterSocket.socketId).emit('newNotification', {
        message: `You have a new claim request on: ${item.itemName}`,
      });
    }

    // Return populated for convenience
    const populated = await Claim.findById(newClaim._id)
      .populate('item', 'itemName media')
      .populate('claimer', 'name department')
      .populate('itemReporter', 'name department');

    res.status(201).json(populated);
  } catch (err) {
    console.error('createClaim error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

/* -------------------------------------------------------
 * Step 2: Reporter responds to chat request
 * ----------------------------------------------------- */
exports.respondToChatRequest = async (req, res) => {
  const { response } = req.body; // 'accept' or 'reject'
  try {
    const claimId = getClaimId(req);
    const claim = await Claim.findById(claimId).populate('claimer', 'name');

    if (!claim) return res.status(404).json({ msg: 'Claim not found' });
    if (claim.itemReporter.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    claim.status = response === 'accept' ? 'chat-active' : 'chat-rejected';
    await claim.save();

    // Notify the claimer (if online)
    const claimerId = claim.claimer._id.toString();
    const claimerSocket = req.onlineUsers?.find(u => u.userId === claimerId);
    if (claimerSocket) {
      const message =
        response === 'accept'
          ? 'Your chat request was accepted. You can now chat with the reporter.'
          : 'Your chat request was rejected.';
      req.io.to(claimerSocket.socketId).emit('newNotification', { message });
    }

    const populated = await Claim.findById(claim._id)
      .populate('item', 'itemName media')
      .populate('claimer', 'name department')
      .populate('itemReporter', 'name department');

    res.json(populated);
  } catch (err) {
    console.error('respondToChatRequest error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

/* -------------------------------------------------------
 * Step 3: Reporter marks claim as resolved
 * ----------------------------------------------------- */
exports.reporterResolveClaim = async (req, res) => {
  try {
    const claimId = getClaimId(req);
    const claim = await Claim.findById(claimId).populate('claimer', 'name');

    if (!claim) return res.status(404).json({ msg: 'Claim not found' });
    if (claim.itemReporter.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    claim.status = 'resolved-by-reporter';
    await claim.save();

    // Notify the claimer to confirm retrieval
    const claimerId = claim.claimer?._id?.toString?.();
    if (claimerId) {
      const claimerSocket = req.onlineUsers?.find(u => u.userId === claimerId);
      if (claimerSocket) {
        req.io.to(claimerSocket.socketId).emit('newNotification', {
          message:
            'The item reporter has marked your claim as resolved. Please confirm you have received the item.',
        });
      }
    }

    const populated = await Claim.findById(claim._id)
      .populate('item', 'itemName media')
      .populate('claimer', 'name department')
      .populate('itemReporter', 'name department');

    res.json(populated);
  } catch (err) {
    console.error('reporterResolveClaim error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

/* -------------------------------------------------------
 * Step 4: Claimer confirms retrieval (awards points)
 * ----------------------------------------------------- */
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

    // NEW: broadcast updates
    // 1) Global notice so Matches pages can remove the item immediately
    req.io.emit('itemRetrieved', { itemId: String(item._id), claimId: String(claim._id) });

    // 2) Directly inform both participants so their Query pages can update
    const participants = [String(claim.claimer), String(claim.itemReporter)];
    participants.forEach(uid => {
      const sock = req.onlineUsers.find(u => u.userId === uid);
      if (sock) {
        req.io.to(sock.socketId).emit('claimUpdated', {
          claimId: String(claim._id),
          status: claim.status,
          itemId: String(item._id),
        });
      }
    });

    res.json(claim);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

/* -------------------------------------------------------
 * Lists
 * ----------------------------------------------------- */
exports.getReceivedClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ itemReporter: req.user.id })
      .populate('item', 'itemName media')
      .populate('claimer', 'name department')
      .populate('itemReporter', 'name department');
    res.json(claims);
  } catch (err) {
    console.error('getReceivedClaims error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.getMadeClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimer: req.user.id })
      .populate('item', 'itemName media')
      .populate('itemReporter', 'name department')
      .populate('claimer', 'name department');
  res.json(claims);
  } catch (err) {
    console.error('getMadeClaims error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};
