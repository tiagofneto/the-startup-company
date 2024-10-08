import { companies, streams } from '../schema.js';
import { eq, and } from 'drizzle-orm';
import { fetchCompany } from './company.js';
import { db } from './db.js';

export async function uploadStream(
  user_id: string,
  handle: string,
  rate: number
) {
  console.log('Creating stream in database:', user_id, handle, rate);
  // TODO: try to pass company_id instead of handle
  const company = await fetchCompany(handle);
  await db
    .insert(streams)
    .values({ userId: user_id, companyId: company.id, rate: rate });
  console.log('Stream created successfully');
}

export async function fetchUserStreams(user_id: string) {
  console.log('Fetching streams from database:', user_id);
  const fetchedStreams = await db
    .select()
    .from(streams)
    .where(eq(streams.userId, user_id));
  console.log('Streams fetched successfully:', fetchedStreams);
  return fetchedStreams;
}

export async function fetchUserCompanyStreams(handle: string, user_id: string) {
  console.log(
    'Fetching streams from database for user:',
    user_id,
    'and company:',
    handle
  );
  const fetchedStreams = await db
    .select({
      id: streams.id,
      rate: streams.rate
    })
    .from(streams)
    .innerJoin(companies, eq(streams.companyId, companies.id))
    .where(and(eq(companies.handle, handle), eq(streams.userId, user_id)));
  console.log('Streams fetched successfully:', fetchedStreams);
  return fetchedStreams;
}
