import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Database connection - always use PostgreSQL
let db: any = null;
let pool: any = null;
let hasDbConnection = false;

async function initializeDatabase() {
  if (process.env.DATABASE_URL) {
    try {
      pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      // Test connection
      await pool.query('SELECT NOW()');
      
      db = drizzle(pool, { schema });
      hasDbConnection = true;
      console.log("✅ PostgreSQL database connected successfully");
    } catch (error) {
      hasDbConnection = false;
      db = null;
      pool = null;
      console.error(
        "❌ Database connection failed. Falling back to in-memory storage. " +
          "Check DATABASE_URL in .env (usually needs user:pass@host:port/db).",
        error,
      );
    }
  } else {
    console.log("⚠️  No DATABASE_URL found, using in-memory storage for development");
    hasDbConnection = false;
    db = null;
    pool = null;
  }
}

// Initialize database
await initializeDatabase();

export { pool, db, hasDbConnection };
