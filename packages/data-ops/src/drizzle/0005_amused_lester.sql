CREATE TABLE `platform_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`allow_multiple_organizations` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text
);
