CREATE TYPE "public"."collector_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'mobile_money', 'bank', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'posted', 'voided', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('pending', 'synced', 'failed', 'duplicate');--> statement-breakpoint
CREATE TYPE "public"."role_name" AS ENUM('admin', 'finance_officer', 'collector');--> statement-breakpoint
CREATE TYPE "public"."sync_log_status" AS ENUM('success', 'partial', 'failed');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"metadata" jsonb,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ward_id" uuid,
	"employee_number" text,
	"status" "collector_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"business_name" text,
	"national_id" text,
	"phone_number" text,
	"address" text,
	"ward_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_number" text NOT NULL,
	"payer_id" uuid NOT NULL,
	"collector_id" uuid NOT NULL,
	"revenue_source_id" uuid NOT NULL,
	"ward_id" uuid,
	"amount" numeric(14, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_date" date NOT NULL,
	"notes" text,
	"offline_reference_id" text,
	"sync_status" "sync_status" DEFAULT 'pending' NOT NULL,
	"status" "payment_status" DEFAULT 'posted' NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"receipt_number" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenue_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "role_name" NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text DEFAULT 'bulk_payment_sync' NOT NULL,
	"payload_count" integer DEFAULT 0 NOT NULL,
	"success_count" integer DEFAULT 0 NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"status" "sync_log_status" DEFAULT 'success' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text,
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "collectors" ADD CONSTRAINT "collectors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "collectors" ADD CONSTRAINT "collectors_ward_id_wards_id_fk" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payers" ADD CONSTRAINT "payers_ward_id_wards_id_fk" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payer_id_payers_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."payers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_collector_id_collectors_id_fk" FOREIGN KEY ("collector_id") REFERENCES "public"."collectors"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_revenue_source_id_revenue_sources_id_fk" FOREIGN KEY ("revenue_source_id") REFERENCES "public"."revenue_sources"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_ward_id_wards_id_fk" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "collectors_user_unique" ON "collectors" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "collectors_employee_unique" ON "collectors" USING btree ("employee_number");--> statement-breakpoint
CREATE INDEX "collectors_ward_idx" ON "collectors" USING btree ("ward_id");--> statement-breakpoint
CREATE INDEX "collectors_status_idx" ON "collectors" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "payers_national_id_unique" ON "payers" USING btree ("national_id");--> statement-breakpoint
CREATE INDEX "payers_ward_idx" ON "payers" USING btree ("ward_id");--> statement-breakpoint
CREATE INDEX "payers_name_idx" ON "payers" USING btree ("full_name");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_receipt_number_unique" ON "payments" USING btree ("receipt_number");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_offline_reference_unique" ON "payments" USING btree ("offline_reference_id") WHERE "payments"."offline_reference_id" is not null;--> statement-breakpoint
CREATE INDEX "payments_payment_date_idx" ON "payments" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "payments_collector_idx" ON "payments" USING btree ("collector_id");--> statement-breakpoint
CREATE INDEX "payments_ward_idx" ON "payments" USING btree ("ward_id");--> statement-breakpoint
CREATE INDEX "payments_revenue_source_idx" ON "payments" USING btree ("revenue_source_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "receipts_payment_unique" ON "receipts" USING btree ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "receipts_number_unique" ON "receipts" USING btree ("receipt_number");--> statement-breakpoint
CREATE INDEX "receipts_number_idx" ON "receipts" USING btree ("receipt_number");--> statement-breakpoint
CREATE UNIQUE INDEX "revenue_sources_name_unique" ON "revenue_sources" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "revenue_sources_code_unique" ON "revenue_sources" USING btree ("code");--> statement-breakpoint
CREATE INDEX "revenue_sources_category_idx" ON "revenue_sources" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_name_unique" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "sync_logs_user_idx" ON "sync_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sync_logs_status_idx" ON "sync_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sync_logs_created_at_idx" ON "sync_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wards_name_unique" ON "wards" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "wards_code_unique" ON "wards" USING btree ("code");--> statement-breakpoint
CREATE INDEX "wards_name_idx" ON "wards" USING btree ("name");