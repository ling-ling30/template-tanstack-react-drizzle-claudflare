ALTER TABLE `organization` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
-- Fold the legacy app-level `organizations` table into Better Auth's `organization`
-- (now the single source of truth) before dropping it. Idempotent on re-run.
INSERT OR IGNORE INTO `organization` (`id`, `name`, `slug`, `created_at`, `status`)
SELECT `id`, `name`, `slug`, CAST(strftime('%s', `created_at`) AS integer) * 1000, `status` FROM `organizations`;--> statement-breakpoint
DROP TABLE `organizations`;
