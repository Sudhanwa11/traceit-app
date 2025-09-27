const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../utils/encryption');

// --- Register Function ---
// Now correctly handles optional Aadhaar number during registration
exports.registerUser = async (req, res) => {
    const { name, email, password, rollNumber, phoneNumber, department, address, aadharNumber } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) { return res.status(400).json({ msg: 'User with this email already exists' }); }
        user = await User.findOne({ rollNumber });
        if (user) { return res.status(400).json({ msg: 'User with this roll number already exists' }); }

        user = new User({ name, email, password, rollNumber, phoneNumber, department, address });

        // Encrypt Aadhaar number if provided
        if (aadharNumber) {
            user.aadharNumber = encrypt(aadharNumber);
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// --- Login Function ---
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) { return res.status(400).json({ msg: 'Invalid Credentials' }); }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(400).json({ msg: 'Invalid Credentials' }); }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// --- Get Logged-In User Function ---
exports.getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- Update General User Details ---
// This function NO LONGER handles aadharNumber
exports.updateUserDetails = async (req, res) => {
    const { name, phoneNumber, department, rollNumber, address } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) { return res.status(404).json({ msg: 'User not found' }); }

        if (rollNumber && rollNumber !== user.rollNumber) {
            const existingUser = await User.findOne({ rollNumber });
            if (existingUser) { return res.status(400).json({ msg: 'This roll number is already registered.' }); }
            user.rollNumber = rollNumber;
        }

        user.name = name || user.name;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.department = department || user.department;
        user.address = address !== undefined ? address : user.address;

        await user.save();
        const userToReturn = await User.findById(req.user.id).select('-password');
        res.json(userToReturn);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- View Sensitive Data (Aadhaar) ---
exports.viewSensitiveData = async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) { return res.status(404).json({ msg: 'User not found' }); }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(400).json({ msg: 'Invalid password' }); }
        const decryptedAadhaar = user.aadharNumber ? decrypt(user.aadharNumber) : '';
        res.json({ decryptedAadhaar });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- Update Sensitive Data (Aadhaar) ---
exports.updateSensitiveData = async (req, res) => {
    const { password, aadharNumber } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) { return res.status(404).json({ msg: 'User not found' }); }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(400).json({ msg: 'Invalid password' }); }

        if (aadharNumber) {
            user.aadharNumber = encrypt(aadharNumber);
        } else {
            user.aadharNumber = undefined;
        }

        await user.save();
        res.json({ msg: 'Aadhaar details updated successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- Change Password ---
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password.' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ msg: 'Password updated successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- Delete Account ---
exports.deleteAccount = async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect password. Account not deleted.' });
        }
        await User.findByIdAndDelete(req.user.id);
        res.json({ msg: 'Account deleted successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};