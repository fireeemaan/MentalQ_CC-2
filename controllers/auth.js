// controllers/auth.js
const { sequelize } = require('../config/database');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Credentials = require('../models/credentials');
const UserSession = require('../models/user_sessions');
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res) => {
    const { email, password, name, birthday } = req.body;
    const [day, month, year] = birthday.split('/');
    const birthdayDate = new Date(`${year}-${month}-${day}`);

    // Start a new transaction
    const t = await sequelize.transaction();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // 1. Insert into credentials table
        const newCredentials = await Credentials.create(
            { email, password: hashedPassword },
            { transaction: t }
        );

        // 2. Insert into users table, using credentials_id from the credentials table
        const newUser = await User.create(
            {
                credentials_id: newCredentials.credentials_id,
                email,
                name,
                birthday: birthdayDate
            },
            { transaction: t }
        );

        const token = jwt.sign({ user_id: newUser.user_id }, process.env.TOKEN_SECRET);

        await UserSession.create({ 
            user_id: newUser.user_id, 
            session_token: token }, 
            { transaction: t });

        // Commit the transaction if both inserts are successful
        await t.commit();

        const safeUser  = {
            email: newUser.email,
            name: newUser.name,
            birthday: newUser.birthday
        }

        // Respond with the created user
        res.status(201).json({
            error: false,
            message: 'User registered successfully!',
            user: safeUser,
            token: token,
        });
    } catch (error) {
        // Rollback the transaction in case of an error
        await t.rollback();
        res.status(400).json({ error: true, message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    const t = await sequelize.transaction();

    try {
        if (!email || !password) {
            res.status(400).json({ error: true, message: 'Email and password are required' });
            return;
        }

        const user = await User.findOne({
            where: { email },
            include: 'credentials',
            transaction: t,
        });

        if (!user) {
            res.status(404).json({ error: true, message: 'User not found' });
            return;
        }

        const validPassword = await bcrypt.compare(password, user.credentials.password);

        if (!validPassword) {
            res.status(401).json({ error: true, message: 'Invalid password' });
            return;
        }

        const token = jwt.sign({ user_id: user.user_id }, process.env.TOKEN_SECRET);

        await UserSession.update(
            { session_token: token },
            {
              where: { user_id: user.user_id },
              transaction: t
            }
          );

        await t.commit();

        const safeUser = {
            email: user.email,
            name: user.name,
            birthday: user.birthday
        }

        res.status(200).json({ 
            error: false,
            message: 'User logged in successfully',
            user: safeUser,
            token: token  
        });

    } catch (error) {
        await t.rollback();
        res.status(400).json({ error: error.message });
    }
};


exports.logoutUser = async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];

    const t = await sequelize.transaction();

    try {
        await UserSession.destroy({ where: { token }, transaction: t });
        await t.commit();

        res.json({ 
            error: false,
            message: 'User logged out successfully' 
        });
    } catch (error) {
        await t.rollback();
        res.status(400).json({ error: true, message: error.message });
    }
};

