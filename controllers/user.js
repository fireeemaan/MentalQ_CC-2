// controllers/user.js
const User = require('../models/users');

// Create a new user
exports.createUser = async (req, res) => {
    const { credentials_id, email, name, birthday } = req.body;
    try {
        const newUser = await User.create({ credentials_id, email, name, birthday });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific user by ID
exports.getUserById = async (req, res) => {
    const id = req.user_id;
    try {
        const user = await User.findByPk(id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, name, birthday } = req.body;
    try {
        const user = await User.findByPk(id);
        if (user) {
            user.email = email ?? user.email;
            user.name = name ?? user.name;
            user.birthday = birthday ?? user.birthday;
            await user.save();
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id);
        if (user) {
            await user.destroy();
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
