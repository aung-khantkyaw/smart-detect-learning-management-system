import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// dotenv.config();
dotenv.config({ path: ".env" }); 

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
     url: process.env.DATABASE_URL  || 'postgresql://sdlms:sdlms_password@localhost:5432/sdlms',
    // url: process.env.DATABASE_URL || 'postgresql://postgres.cysuboobcnusszgqahfy:[Kaungsett34#]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'
  },
});
