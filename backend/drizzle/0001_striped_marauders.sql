DO $$ BEGIN
 CREATE TYPE "public"."payment_type" AS ENUM('wire', 'stream');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_origin" varchar(255) NOT NULL,
	"company_destination" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"type" "payment_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_company_origin_companies_handle_fk" FOREIGN KEY ("company_origin") REFERENCES "public"."companies"("handle") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_company_destination_companies_handle_fk" FOREIGN KEY ("company_destination") REFERENCES "public"."companies"("handle") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
