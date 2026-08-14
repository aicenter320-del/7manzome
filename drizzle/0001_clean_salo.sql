CREATE TABLE `staff_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`is_system` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_roles_slug_unique` ON `staff_roles` (`slug`);--> statement-breakpoint
CREATE TABLE `staff_role_grants` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`section` text NOT NULL,
	`level` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `staff_roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_role_grants_role_section_unique` ON `staff_role_grants` (`role_id`,`section`);--> statement-breakpoint
CREATE INDEX `staff_role_grants_role_idx` ON `staff_role_grants` (`role_id`);