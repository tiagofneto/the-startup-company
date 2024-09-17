CREATE TABLE IF NOT EXISTS "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"director" varchar(255) NOT NULL,
	"total_shares" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
