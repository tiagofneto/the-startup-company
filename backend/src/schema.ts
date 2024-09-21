import {
    pgTable,
    serial,
    varchar,
    timestamp,
    integer,
    pgSchema,
    uuid,
    boolean,
    primaryKey
  } from 'drizzle-orm/pg-core';

  const authSchema = pgSchema('auth');

  const users = authSchema.table('users', {
    id: uuid('id').primaryKey(),
  });
  
  export const companies = pgTable('companies', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    handle: varchar('handle', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull(),
    director: varchar('director', { length: 255 }).notNull(),
    totalShares: integer('total_shares').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
  });

  export const userProfiles = pgTable('user_profiles', {
    id: uuid('user_id').primaryKey().references(() => users.id).notNull(),
    kyc_verified: boolean('kyc_verified').notNull().default(false),
  });

  export const userCompanies = pgTable('user_companies', {
    userId: uuid('user_id')
      .notNull()
      .references(() => userProfiles.id),
    companyId: integer('company_id')
      .notNull()
      .references(() => companies.id),
  }, (t) => ({
    id: primaryKey({ columns: [t.userId, t.companyId] }),
  }));