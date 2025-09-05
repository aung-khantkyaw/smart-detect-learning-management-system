import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://sdlms:sdlms_password@127.0.0.1:5432/sdlms';
console.log('Using DATABASE_URL:', connectionString.replace(/:[^:@]*@/, ':***@'));

// Create postgres client with connection pool and retry configuration
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Disable prepared statements to avoid some connection issues
  onnotice: () => {}, // Disable notices
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export client for cleanup if needed
export { client };

// Test connection function
export async function testConnection() {
  try {
    await client`SELECT 1`;
    console.log('✅ Database connected: ', connectionString.replace(/:[^:@]*@/, ':***@'));
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
