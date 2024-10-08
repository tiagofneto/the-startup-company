import { Company } from '../types.js';
import { companies, userCompanies, userProfiles, users } from '../schema.js';
import { eq } from 'drizzle-orm';
import { getUserEmail } from './user.js';
import { db } from './db.js';

export async function uploadCompany(company: Company) {
  console.log('Uploading company to database:', company);
  const companyId = (
    await db.insert(companies).values(company).returning({ id: companies.id })
  )[0].id;
  console.log('Company uploaded successfully with id:', companyId);
  return companyId;
}

export async function fetchCompany(handle: string) {
  console.log('Fetching company from database:', handle);
  const company =
    (
      await db
        .select()
        .from(companies)
        .where(eq(companies.handle, handle))
        .limit(1)
    )[0] || null;
  console.log('Company fetched successfully:', company);
  return company;
}

export async function getCompanies() {
  console.log('Fetching companies from database');
  const companyList = (await db.select().from(companies)) as Company[];
  return companyList;
}

export async function createCompanyUser(email: string, company_id: number) {
  console.log('Creating user company in database:', email, company_id);
  await db
    .insert(userCompanies)
    .values({ email: email, companyId: company_id });
  console.log('User company created successfully');
}

export async function fetchCompanyPeople(handle: string) {
  console.log('Fetching company people from database:', handle);
  const fetchedCompanyPeople = await db
    .select({
      id: users.id,
      email: userCompanies.email,
      raw_user_meta_data: users.raw_user_meta_data,
      kyc_verified: userProfiles.kyc_verified
    })
    .from(userCompanies)
    .innerJoin(companies, eq(userCompanies.companyId, companies.id))
    .leftJoin(users, eq(userCompanies.email, users.email))
    .leftJoin(userProfiles, eq(users.id, userProfiles.id))
    .where(eq(companies.handle, handle));

  console.log('Company people fetched successfully:', fetchedCompanyPeople);
  return fetchedCompanyPeople;
}

export async function fetchUserCompanies(user_id: string) {
  console.log('Fetching user companies from database:', user_id);
  const userEmail = await getUserEmail(user_id);
  const fetchedUserCompanies = await db
    .select({
      id: companies.id,
      name: companies.name,
      handle: companies.handle
    })
    .from(userCompanies)
    .innerJoin(companies, eq(userCompanies.companyId, companies.id))
    .where(eq(userCompanies.email, userEmail));

  console.log('User companies fetched successfully:', fetchedUserCompanies);
  return fetchedUserCompanies;
}

export async function createUserCompany(user_id: string, company_id: number) {
  console.log('Creating user company in database:', user_id, company_id);
  const userEmail = await getUserEmail(user_id);
  await db
    .insert(userCompanies)
    .values({ email: userEmail, companyId: company_id });
  console.log('User company created successfully');
}
