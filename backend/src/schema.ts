import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  pgSchema,
  uuid,
  boolean,
  primaryKey,
  jsonb,
  text,
  pgEnum
} from 'drizzle-orm/pg-core';

const authSchema = pgSchema('auth');

export const paymentTypes = pgEnum('payment_type', ['wire', 'stream']);

export const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  raw_user_meta_data: jsonb('raw_user_meta_data').notNull()
});

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  handle: varchar('handle', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  director: varchar('director', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const userProfiles = pgTable('user_profiles', {
  id: uuid('user_id')
    .primaryKey()
    .references(() => users.id)
    .notNull(),
  kyc_verified: boolean('kyc_verified').notNull().default(false)
});

export const userCompanies = pgTable(
  'user_companies',
  {
    email: varchar('email', { length: 255 }).notNull(),
    companyId: integer('company_id')
      .notNull()
      .references(() => companies.id)
  },
  (t) => ({
    id: primaryKey({ columns: [t.email, t.companyId] })
  })
);

export const streams = pgTable('streams', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  rate: integer('rate').notNull(),
  startDate: timestamp('start_date', { withTimezone: true })
    .notNull()
    .defaultNow(),
  totalClaimed: integer('total_claimed').notNull().default(0)
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  companyOrigin: varchar('company_origin', { length: 255 })
    .notNull()
    .references(() => companies.handle),
  companyDestination: varchar('company_destination', { length: 255 })
    .notNull()
    .references(() => companies.handle),
  amount: integer('amount').notNull(),
  type: paymentTypes('type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const shareholders = pgTable(
  'shareholders',
  {
    companyId: integer('company_id')
      .notNull()
      .references(() => companies.id),
    email: varchar('email', { length: 255 }).notNull(),
    shares: integer('shares').notNull(),
    funded: boolean('funded').notNull().default(false)
  },
  (t) => ({
    id: primaryKey({ columns: [t.companyId, t.email] })
  })
);
