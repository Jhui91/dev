const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_L_HOST,
  user: process.env.DB_L_USER,
  password: process.env.DB_L_PASSWORD,
  database: process.env.DB_L_NAME
});

module.exports = db;
