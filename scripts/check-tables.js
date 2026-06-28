require('dotenv').config();
const mysql = require('mysql2/promise');

const host = process.env.DB_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'motorpartshub';

(async () => {
  try {
    console.log(`Connecting to ${host}:${port} as ${user} (db=${database})`);
    const conn = await mysql.createConnection({ host, port, user, password, database });
    const [rows] = await conn.query('SHOW TABLES');
    if (!rows.length) {
      console.log('No tables found in database.');
    } else {
      console.log('Tables:');
      rows.forEach(r => console.log(' -', Object.values(r)[0]));
    }
    await conn.end();
  } catch (e) {
    console.error('MySQL check failed:', e.message);
    process.exitCode = 1;
  }
})();
