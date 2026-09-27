CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text,
	`actor_id` text NOT NULL,
	`actor_email` text,
	`action` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text,
	`metadata` text,
	`ip_address` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`key_hash` text NOT NULL,
	`prefix` text NOT NULL,
	`last_used_at` text,
	`expires_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_hash_unique` ON `api_keys` (`key_hash`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`organization_id` text,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`link` text,
	`read_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment_config` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`environment` text NOT NULL,
	`doku_sandbox_client_id` text,
	`doku_sandbox_secret_key` text,
	`doku_production_client_id` text,
	`doku_production_secret_key` text,
	`midtrans_sandbox_server_key` text,
	`midtrans_production_server_key` text,
	`updated_at` integer NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`organization_id` text,
	`user_id` text,
	`amount_idr` integer NOT NULL,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`status` text NOT NULL,
	`provider` text NOT NULL,
	`provider_env` text,
	`provider_order_id` text,
	`method` text,
	`metadata` text,
	`paid_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_order_id_unique` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `payments_org_idx` ON `payments` (`organization_id`);--> statement-breakpoint
CREATE INDEX `payments_user_idx` ON `payments` (`user_id`);--> statement-breakpoint
CREATE INDEX `payments_order_idx` ON `payments` (`order_id`);--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`user_email` text,
	`organization_id` text,
	`category` text DEFAULT 'bug' NOT NULL,
	`severity` text DEFAULT 'medium' NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`page_url` text NOT NULL,
	`metadata` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text NOT NULL
);
