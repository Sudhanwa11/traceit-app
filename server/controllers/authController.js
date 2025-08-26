// server/controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../utils/encryption');

// Function to handle user registration
exports.registerUser = async (req, res) => {
    const { name, email, password, rollNumber, phoneNumber, department } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        user = await User.findOne({ rollNumber });
        if (user) {
            return res.status(400).json({ msg: 'User with this roll number already exists' });
        }

        user = new User({
            name,
            email,
            password,
            rollNumber,
            phoneNumber,
            department,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Function to handle user login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Function to get the currently logged-in user's data
exports.getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Function to update user details
exports.updateUserDetails = async (req, res) => {
    const { name, phoneNumber, department, address, rollNumber, aadharNumber } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if new roll number is already taken
        if (rollNumber && rollNumber !== user.rollNumber) {
            const existingUser = await User.findOne({ rollNumber });
            if (existingUser) {
                return res.status(400).json({ msg: 'This roll number is already registered.' });
            }
            user.rollNumber = rollNumber;
        }

        // Update fields
        user.name = name || user.name;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.department = department || user.department;
        user.address = address || user.address;
        user.aadharNumber = aadharNumber || user.aadharNumber;

        await user.save();

        const userToReturn = await User.findById(req.user.id).select('-password');
        res.json(userToReturn);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Function to change password - NEW
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        res.status(200).json({ msg: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Function to delete user account - NEW
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        await User.findByIdAndDelete(userId);
        res.status(200).json({ msg: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Existing functions for updating and viewing sensitive data (with encryption, password check)...

exports.updateSensitiveData = async (req, res) => {
    const { password, aadharNumber } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid password' });
        }

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

exports.viewSensitiveData = async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid password' });
        }

        const decryptedAadhaar = user.aadharNumber ? decrypt(user.aadharNumber) : '';
        res.json({ decryptedAadhaar });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
