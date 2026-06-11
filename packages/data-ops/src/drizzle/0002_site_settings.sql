CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`site_name` text NOT NULL,
	`og_title` text NOT NULL,
	`og_description` text NOT NULL,
	`og_image` text,
	`updated_at` text NOT NULL
);
