CREATE TABLE IF NOT EXISTS "shareholders" (
	"company_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"shares" integer NOT NULL,
	CONSTRAINT "shareholders_company_id_user_id_pk" PRIMARY KEY("company_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shareholders" ADD CONSTRAINT "shareholders_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shareholders" ADD CONSTRAINT "shareholders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
