import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres';
import { Company } from './types.js';
import { companies, userCompanies, userProfiles } from './schema.js';
import { eq } from 'drizzle-orm';
import { users } from './schema.js';

const connectionString = process.env.SUPABASE_DATABASE_URI as string;

if (!connectionString) {
    throw new Error('SUPABASE_DATABASE_URI is not defined in the environment variables');
}

const client = postgres(connectionString, { prepare: false })
const db = drizzle(client);

async function getUserEmail(user_id: string) {
    console.log('Fetching user email from database:', user_id);
    const user = (await db.select({ email: users.email }).from(users).where(eq(users.id, user_id)).limit(1))[0];
    const { email } = user;
    console.log('User email fetched successfully:', email);
    return email;
}

export async function uploadCompany(company: Company) {
    console.log('Uploading company to database:', company);
    const companyId = (await db.insert(companies).values(company).returning({ id: companies.id }))[0].id;
    console.log('Company uploaded successfully with id:', companyId);
    return companyId;
}

export async function fetchCompany(handle: string) {
    console.log('Fetching company from database:', handle);
    const company = (await db.select().from(companies).where(eq(companies.handle, handle)).limit(1))[0] || null;
    console.log('Company fetched successfully:', company);
    return company;
}

export async function getCompanies() {
    console.log('Fetching companies from database');
    const companyList = await db.select().from(companies) as Company[];
    return companyList;
}

export async function createOrGetUser(user_id: string) {
    console.log('Fetching user from database:', user_id);
    let user = (await db.select().from(userProfiles).where(eq(userProfiles.id, user_id)).limit(1))[0];
    
    if (!user) {
        console.log('User not found, creating user:', user_id);
        user = (await db.insert(userProfiles).values({ id: user_id }).returning())[0];
    }

    console.log('User fetched/created successfully');
    return user;
}

export async function fetchUserCompanies(user_id: string) {
    console.log('Fetching user companies from database:', user_id);
    const userEmail = await getUserEmail(user_id);
    const fetchedUserCompanies = await db.select({
        name: companies.name,
        handle: companies.handle
    }).
    from(userCompanies)
    .innerJoin(companies, eq(userCompanies.companyId, companies.id))
    .where(eq(userCompanies.email, userEmail));

    console.log('User companies fetched successfully:', fetchedUserCompanies);
    return fetchedUserCompanies;
}

export async function createUserCompany(user_id: string, company_id: number) {
    console.log('Creating user company in database:', user_id, company_id);
    const userEmail = await getUserEmail(user_id);
    await db.insert(userCompanies).values({ email: userEmail, companyId: company_id });
    console.log('User company created successfully');
}

export async function createCompanyUser(email: string, company_id: number) {
    console.log('Creating user company in database:', email, company_id);
    await db.insert(userCompanies).values({ email: email, companyId: company_id });
    console.log('User company created successfully');
}

export async function fetchCompanyPeople(handle: string) {
    console.log('Fetching company people from database:', handle);
    const fetchedCompanyPeople = await db.select({
        email: userCompanies.email,
        raw_user_meta_data: users.raw_user_meta_data
    }).
    from(userCompanies)
    .innerJoin(companies, eq(userCompanies.companyId, companies.id))
    .leftJoin(users, eq(userCompanies.email, users.email))
    .where(eq(companies.handle, handle));

    console.log('Company people fetched successfully:', fetchedCompanyPeople);
    return fetchedCompanyPeople;
}
