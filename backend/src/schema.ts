import {
    pgTable,
    serial,
    varchar,
    timestamp,
    integer,
    pgSchema,
    uuid,
    boolean
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
    user_id: uuid('user_id').primaryKey().references(() => users.id).notNull(),
    companies: integer('companies').array().references(() => companies.id).notNull().default([]),
    kyc_verified: boolean('kyc_verified').notNull().default(false),
  });