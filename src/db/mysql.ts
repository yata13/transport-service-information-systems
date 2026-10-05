import mysql from 'mysql2/promise';

export interface MySQLConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

// Pool connection for high throughput and stability
let pool: mysql.Pool | null = null;

export function getMySQLPool(): mysql.Pool | null {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE || 'gondar_traffic_db';
  const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;

  if (!host || !user) {
    return null;
  }

  if (!pool) {
    try {
      pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
      });
    } catch (err) {
      console.error('Failed to initialize MySQL pool:', err);
      return null;
    }
  }

  return pool;
}

export async function testMySQLConnection(): Promise<{ connected: boolean; message: string }> {
  const pool = getMySQLPool();
  if (!pool) {
    return {
      connected: false,
      message: 'MySQL environment variables (MYSQL_HOST, MYSQL_USER) not configured.'
    };
  }

  try {
    const connection = await pool.getConnection();
    connection.release();
    return {
      connected: true,
      message: 'Successfully connected to Gondar Traffic MySQL Database.'
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      connected: false,
      message: `MySQL connection error: ${err.message}`
    };
  }
}
