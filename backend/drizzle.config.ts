import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  schemaFilter: 'public',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DATABASE_URI as string
  }
});
