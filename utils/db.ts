import mysql from 'mysql2/promise';

let pool: mysql.Pool | undefined;

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool.getConnection();
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}