import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres';
import { Company } from './types.js';
import { companies } from './schema.js';
import { eq } from 'drizzle-orm';

const connectionString = process.env.SUPABASE_DATABASE_URI as string;

if (!connectionString) {
    throw new Error('SUPABASE_DATABASE_URI is not defined in the environment variables');
}

const client = postgres(connectionString, { prepare: false })
const db = drizzle(client);

export async function uploadCompany(company: Company) {
    console.log('Uploading company to database:', company);
    await db.insert(companies).values(company);
    console.log('Company uploaded successfully');
}

export async function fetchCompany(handle: string) {
    console.log('Fetching company from database:', handle);
    const company = (await db.select().from(companies).where(eq(companies.handle, handle)))[0];
    console.log('Company fetched successfully:', company);
    return company;
}

export async function getCompanies() {
    console.log('Fetching companies from database');
    const companyList = await db.select().from(companies) as Company[];
    return companyList;
}