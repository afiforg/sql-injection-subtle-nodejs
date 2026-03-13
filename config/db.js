const { Pool } = require('pg');

const poolConfig = () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sqli_subtle_test',
});

let pool = null;

async function getPool() {
  if (pool) return pool;
  pool = new Pool(poolConfig());
  return pool;
}

async function initSchema(pool) {
  const client = await pool.connect();
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL
    );
  `);
    const count = (await client.query('SELECT 1 FROM users LIMIT 1')).rowCount;
    if (count === 0) {
      await client.query(`
        INSERT INTO users (username, email) VALUES
        ('admin', 'admin@example.com'),
        ('user1', 'user1@example.com');
      `);
    }
  } finally {
    client.release();
  }
}

module.exports = { getPool, initSchema, poolConfig };
