import {
    pgTable,
    serial,
    varchar,
    timestamp,
    integer
  } from 'drizzle-orm/pg-core';
  
  export const companies = pgTable('companies', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    handle: varchar('handle', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    director: varchar('director', { length: 255 }).notNull(),
    totalShares: integer('total_shares').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
  });
  