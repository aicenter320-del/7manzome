CREATE TABLE `gold_cover_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`amount_mg` integer NOT NULL,
	`karat` integer DEFAULT 18 NOT NULL,
	`pure_mg` integer NOT NULL,
	`paid_rial` integer,
	`source` text DEFAULT 'purchase' NOT NULL,
	`note` text,
	`purchased_at` integer NOT NULL,
	`created_by_user_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `gold_cover_purchased_at_idx` ON `gold_cover_entries` (`purchased_at`);