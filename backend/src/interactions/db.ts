import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres';

const connectionString = process.env.SUPABASE_DATABASE_URI as string;

if (!connectionString) {
    throw new Error('SUPABASE_DATABASE_URI is not defined in the environment variables');
}

const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client);