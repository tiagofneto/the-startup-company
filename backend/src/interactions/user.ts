import { userProfiles, users } from '../schema.js';
import { eq } from 'drizzle-orm';
import { db } from './db.js';

export async function getUserEmail(user_id: string) {
    console.log('Fetching user email from database:', user_id);
    const user = (await db.select({ email: users.email }).from(users).where(eq(users.id, user_id)).limit(1))[0];
    const { email } = user;
    console.log('User email fetched successfully:', email);
    return email;
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

export async function setKycVerified(user_id: string, verified: boolean = true) {
    console.log('Setting KYC verified in database:', user_id);
    await db.update(userProfiles).set({ kyc_verified: verified }).where(eq(userProfiles.id, user_id));
    console.log('KYC verified set successfully');
}
