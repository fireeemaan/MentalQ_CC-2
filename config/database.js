// config/database.js
import mysql2 from 'mysql2';
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,      // Database name
    process.env.DB_USER,      // Database username
    process.env.DB_PASS,      // Database password
    {
        host: process.env.DB_HOST,   // Database host
        port: process.env.DB_PORT,   // Database port
        dialect: mysql2, // Database dialect (e.g., postgres, mysql)
        logging: false,              // Disable SQL query logging (optional)
    }
);

// Test the connection to the database
sequelize.authenticate()
    .then(() => console.log('Database connected...'))
    .catch((err) => console.error('Unable to connect to the database:', err));

module.exports = { sequelize };
