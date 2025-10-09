// server/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../utils/encryption');

/**
 * Helper: sign JWT safely
 */
function signToken(userId, res) {
  const payload = { user: { id: userId } };
  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '5h' },
    (err, token) => {
      if (err) {
        console.error('JWT sign failed:', err);
        return res.status(500).json({ msg: 'Token generation failed' });
      }
      return res.json({ token });
    }
  );
}

/**
 * POST /api/auth/register
 */
exports.registerUser = async (req, res) => {
  let {
    name,
    email,
    password,
    rollNumber,
    phoneNumber,
    department,
    address,
    aadharNumber,
  } = req.body;

  try {
    // Normalize
    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();
    rollNumber = (rollNumber || '').trim();
    phoneNumber = (phoneNumber || '').trim();
    department = (department || '').trim();
    address = (address || '').trim();

    // Basic validation
    const missing = [];
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    if (!rollNumber) missing.push('rollNumber');
    if (!phoneNumber) missing.push('phoneNumber');
    if (!department) missing.push('department');

    if (missing.length) {
      return res
        .status(400)
        .json({ msg: `Missing required fields: ${missing.join(', ')}` });
    }

    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ msg: 'Password must be at least 6 characters.' });
    }

    // Uniqueness pre-checks (race still handled by unique index error)
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    user = await User.findOne({ rollNumber });
    if (user) {
      return res
        .status(400)
        .json({ msg: 'User with this roll number already exists' });
    }

    // Create user
    user = new User({
      name,
      email,
      password, // will be hashed below
      rollNumber,
      phoneNumber,
      department,
      address,
    });

    if (aadharNumber) {
      user.aadharNumber = encrypt(aadharNumber);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(password), salt);

    await user.save();

    return signToken(user.id, res);
  } catch (err) {
    // Duplicate key race
    if (err?.code === 11000) {
      const fields = Object.keys(err.keyPattern || {});
      return res
        .status(400)
        .json({ msg: `Duplicate value for: ${fields.join(', ')}` });
    }
    // Mongoose validation
    if (err?.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ msg: messages.join(' ') });
    }
    console.error('Register error:', err);
    return res.status(500).json({ msg: 'Server error during registration' });
  }
};

/**
 * POST /api/auth/login
 */
exports.loginUser = async (req, res) => {
  let { email, password } = req.body;
  try {
    email = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    return signToken(user.id, res);
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * GET /api/auth
 */
exports.getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).send('Server Error');
  }
};

/**
 * PUT /api/auth/update
 * (General profile data; NOT Aadhaar here)
 */
exports.updateUserDetails = async (req, res) => {
  const { name, phoneNumber, department, rollNumber, address } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (rollNumber && rollNumber !== user.rollNumber) {
      const existingUser = await User.findOne({ rollNumber });
      if (existingUser) {
        return res
          .status(400)
          .json({ msg: 'This roll number is already registered.' });
      }
      user.rollNumber = rollNumber;
    }

    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (department) user.department = department;
    if (typeof address !== 'undefined') user.address = address;

    await user.save();

    const userToReturn = await User.findById(req.user.id).select('-password');
    return res.json(userToReturn);
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).send('Server Error');
  }
};

/**
 * POST /api/auth/view-sensitive
 * Body: { password }
 */
exports.viewSensitiveData = async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    const decryptedAadhaar = user.aadharNumber ? decrypt(user.aadharNumber) : '';
    return res.json({ decryptedAadhaar });
  } catch (err) {
    console.error('View sensitive error:', err);
    return res.status(500).send('Server Error');
  }
};

/**
 * PUT /api/auth/update-sensitive
 * Body: { password, aadharNumber }  (clear/remove by sending empty or omit)
 */
exports.updateSensitiveData = async (req, res) => {
  const { password, aadharNumber } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    if (aadharNumber) {
      user.aadharNumber = encrypt(aadharNumber);
    } else {
      user.aadharNumber = undefined;
    }

    await user.save();
    return res.json({ msg: 'Aadhaar details updated successfully.' });
  } catch (err) {
    console.error('Update sensitive error:', err);
    return res.status(500).send('Server Error');
  }
};

/**
 * PUT /api/auth/change-password
 * Body: { oldPassword, newPassword }
 */
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ msg: 'oldPassword and newPassword are required.' });
  }
  if (String(newPassword).length < 6) {
    return res
      .status(400)
      .json({ msg: 'New password must be at least 6 characters.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(String(oldPassword), user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(newPassword), salt);
    await user.save();

    return res.json({ msg: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).send('Server Error');
  }
};

/**
 * DELETE /api/auth/delete-account
 * Body: { password }
 */
exports.deleteAccount = async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ msg: 'Incorrect password. Account not deleted.' });
    }

    await User.findByIdAndDelete(req.user.id);
    return res.json({ msg: 'Account deleted successfully.' });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).send('Server Error');
  }
};
