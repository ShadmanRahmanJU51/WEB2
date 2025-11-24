// config/db.js  ← THIS IS THE ONLY VERSION THAT WORKS 100% WITH XAMPP
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'taskuser',
    password: 'taskpass123',
    database: 'taskdb',
    port: 3306,                  // ← ADD THIS LINE (XAMPP default)
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();

// Test the connection immediately when the file loads
db.query('SELECT 1')
    .then(() => console.log('✅ MySQL connected successfully as taskuser'))
    .catch(err => console.error('❌ MySQL connection failed:', err.message));

module.exports = db;