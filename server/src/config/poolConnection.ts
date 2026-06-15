import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import dotenv from "dotenv";

const __dirname = import.meta.dirname;

dotenv.config({
    path: `${__dirname}/../../.env`
});

const pool: Pool= mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306, // Convert to number
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;