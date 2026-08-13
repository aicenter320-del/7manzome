CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text,
	`actor_role` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`summary` text NOT NULL,
	`meta` text,
	`ip` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_idx` ON `audit_logs` (`actor_user_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_created_at_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`code_hash` text NOT NULL,
	`purpose` text DEFAULT 'login' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 5 NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	`request_ip` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `otp_codes_phone_idx` ON `otp_codes` (`phone`);--> statement-breakpoint
CREATE INDEX `otp_codes_expires_at_idx` ON `otp_codes` (`expires_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`bucket_key` text NOT NULL,
	`hits` integer DEFAULT 0 NOT NULL,
	`window_started_at` integer NOT NULL,
	`blocked_until_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rate_limits_bucket_key_unique` ON `rate_limits` (`bucket_key`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`user_agent` text,
	`ip` text,
	`expires_at` integer NOT NULL,
	`revoked_at` integer,
	`last_seen_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_at_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`granted_by_user_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`granted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_roles_user_role_unique` ON `user_roles` (`user_id`,`role`);--> statement-breakpoint
CREATE INDEX `user_roles_role_idx` ON `user_roles` (`role`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`national_id` text,
	`birth_date_at` integer,
	`email` text,
	`status` text DEFAULT 'active' NOT NULL,
	`kyc_status` text DEFAULT 'none' NOT NULL,
	`kyc_verified_at` integer,
	`kyc_rejection_reason` text,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_national_id_unique` ON `users` (`national_id`);--> statement-breakpoint
CREATE INDEX `users_kyc_status_idx` ON `users` (`kyc_status`);--> statement-breakpoint
CREATE INDEX `users_created_at_idx` ON `users` (`created_at`);--> statement-breakpoint
CREATE TABLE `media_files` (
	`id` text PRIMARY KEY NOT NULL,
	`storage_key` text NOT NULL,
	`original_name` text,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`width` integer,
	`height` integer,
	`visibility` text DEFAULT 'private' NOT NULL,
	`checksum` text,
	`uploaded_by_user_id` text,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_files_storage_key_unique` ON `media_files` (`storage_key`);--> statement-breakpoint
CREATE INDEX `media_files_visibility_idx` ON `media_files` (`visibility`);--> statement-breakpoint
CREATE TABLE `child_timeline_events` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`occasion_slug` text,
	`title` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`note` text,
	`created_by_user_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `child_timeline_events_child_id_idx` ON `child_timeline_events` (`child_id`);--> statement-breakpoint
CREATE INDEX `child_timeline_events_occurred_at_idx` ON `child_timeline_events` (`occurred_at`);--> statement-breakpoint
CREATE TABLE `children` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`name_en` text,
	`gender` text DEFAULT 'unspecified' NOT NULL,
	`birth_date_at` integer NOT NULL,
	`avatar_file_id` text,
	`note` text,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`avatar_file_id`) REFERENCES `media_files`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `children_owner_user_id_idx` ON `children` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `children_birth_date_at_idx` ON `children` (`birth_date_at`);--> statement-breakpoint
CREATE INDEX `children_archived_at_idx` ON `children` (`archived_at`);--> statement-breakpoint
CREATE TABLE `guardianships` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`user_id` text NOT NULL,
	`relation` text NOT NULL,
	`access_level` text DEFAULT 'viewer' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guardianships_child_user_unique` ON `guardianships` (`child_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `guardianships_user_id_idx` ON `guardianships` (`user_id`);--> statement-breakpoint
CREATE TABLE `gold_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`karat` integer NOT NULL,
	`price_per_gram_rial` integer NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`source_ref` text,
	`effective_at` integer NOT NULL,
	`created_by_user_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `gold_prices_karat_effective_idx` ON `gold_prices` (`karat`,`effective_at`);--> statement-breakpoint
CREATE INDEX `gold_prices_created_at_idx` ON `gold_prices` (`created_at`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`parent_id` text,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_parent_id_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE TABLE `occasions` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`emoji` text,
	`age_min_months` integer,
	`age_max_months` integer,
	`is_recurring` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `occasions_slug_unique` ON `occasions` (`slug`);--> statement-breakpoint
CREATE TABLE `personalizations` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text,
	`child_name_fa` text,
	`child_name_en` text,
	`birth_date_at` integer,
	`message` text,
	`symbol` text,
	`photo_file_id` text,
	`preview_file_id` text,
	`locked_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`photo_file_id`) REFERENCES `media_files`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`preview_file_id`) REFERENCES `media_files`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `personalizations_child_id_idx` ON `personalizations` (`child_id`);--> statement-breakpoint
CREATE TABLE `product_media` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`file_id` text NOT NULL,
	`alt` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`file_id`) REFERENCES `media_files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_media_product_id_idx` ON `product_media` (`product_id`);--> statement-breakpoint
CREATE TABLE `product_occasions` (
	`product_id` text NOT NULL,
	`occasion_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`product_id`, `occasion_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`occasion_id`) REFERENCES `occasions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_occasions_occasion_id_idx` ON `product_occasions` (`occasion_id`);--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`sku` text NOT NULL,
	`title` text NOT NULL,
	`weight_mg` integer NOT NULL,
	`karat` integer DEFAULT 18 NOT NULL,
	`making_fee_bp` integer DEFAULT 0 NOT NULL,
	`profit_bp` integer DEFAULT 0 NOT NULL,
	`premium_rial` integer DEFAULT 0 NOT NULL,
	`packaging_rial` integer DEFAULT 0 NOT NULL,
	`personalization_rial` integer DEFAULT 0 NOT NULL,
	`engraving_max_chars` integer DEFAULT 0 NOT NULL,
	`stock_qty` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_sku_unique` ON `product_variants` (`sku`);--> statement-breakpoint
CREATE INDEX `product_variants_product_id_idx` ON `product_variants` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_variants_is_active_idx` ON `product_variants` (`is_active`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`description` text,
	`category_id` text,
	`kind` text DEFAULT 'jewelry' NOT NULL,
	`brand_line` text DEFAULT 'standard' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_personalizable` integer DEFAULT false NOT NULL,
	`age_min_months` integer,
	`age_max_months` integer,
	`hero_file_id` text,
	`highlights` text,
	`seo_title` text,
	`seo_description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`hero_file_id`) REFERENCES `media_files`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `products_kind_idx` ON `products` (`kind`);--> statement-breakpoint
CREATE INDEX `products_category_id_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE TABLE `gold_ledger_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`treasure_id` text NOT NULL,
	`direction` text NOT NULL,
	`amount_mg` integer NOT NULL,
	`karat` integer DEFAULT 18 NOT NULL,
	`pure_mg` integer NOT NULL,
	`source` text NOT NULL,
	`reference_type` text NOT NULL,
	`reference_id` text NOT NULL,
	`gold_price_per_gram_rial` integer NOT NULL,
	`value_rial` integer NOT NULL,
	`note` text,
	`created_by_user_id` text,
	`occurred_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`treasure_id`) REFERENCES `treasures`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `gold_ledger_treasure_idx` ON `gold_ledger_entries` (`treasure_id`);--> statement-breakpoint
CREATE INDEX `gold_ledger_reference_idx` ON `gold_ledger_entries` (`reference_type`,`reference_id`);--> statement-breakpoint
CREATE INDEX `gold_ledger_occurred_at_idx` ON `gold_ledger_entries` (`occurred_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `gold_ledger_reference_unique` ON `gold_ledger_entries` (`reference_type`,`reference_id`,`direction`);--> statement-breakpoint
CREATE TABLE `treasure_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`treasure_id` text NOT NULL,
	`target_mg` integer NOT NULL,
	`target_date_at` integer,
	`note` text,
	`status` text DEFAULT 'active' NOT NULL,
	`achieved_at` integer,
	`created_by_user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`treasure_id`) REFERENCES `treasures`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `treasure_goals_treasure_idx` ON `treasure_goals` (`treasure_id`);--> statement-breakpoint
CREATE INDEX `treasure_goals_status_idx` ON `treasure_goals` (`status`);--> statement-breakpoint
CREATE TABLE `treasure_milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`treasure_id` text NOT NULL,
	`threshold_mg` integer NOT NULL,
	`title` text NOT NULL,
	`ledger_entry_id` text,
	`achieved_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`treasure_id`) REFERENCES `treasures`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ledger_entry_id`) REFERENCES `gold_ledger_entries`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `treasure_milestones_unique` ON `treasure_milestones` (`treasure_id`,`threshold_mg`);--> statement-breakpoint
CREATE INDEX `treasure_milestones_treasure_idx` ON `treasure_milestones` (`treasure_id`);--> statement-breakpoint
CREATE TABLE `treasures` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`title` text NOT NULL,
	`kind` text DEFAULT 'personal' NOT NULL,
	`occasion_slug` text,
	`event_date_at` integer,
	`invite_message` text,
	`status` text DEFAULT 'active' NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`created_by_user_id` text NOT NULL,
	`asset_owner_user_id` text NOT NULL,
	`closed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`asset_owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `treasures_child_id_idx` ON `treasures` (`child_id`);--> statement-breakpoint
CREATE INDEX `treasures_status_idx` ON `treasures` (`status`);--> statement-breakpoint
CREATE INDEX `treasures_asset_owner_idx` ON `treasures` (`asset_owner_user_id`);--> statement-breakpoint
CREATE INDEX `treasures_created_by_idx` ON `treasures` (`created_by_user_id`);--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`treasure_id` text NOT NULL,
	`gift_link_id` text,
	`contributor_user_id` text,
	`contributor_name` text NOT NULL,
	`contributor_phone` text,
	`relation_label` text,
	`amount_rial` integer NOT NULL,
	`gold_mg` integer,
	`karat` integer,
	`gold_price_per_gram_rial` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`keepsake_message` text,
	`is_anonymous` integer DEFAULT false NOT NULL,
	`confirmed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`treasure_id`) REFERENCES `treasures`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`gift_link_id`) REFERENCES `gift_links`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contributor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `contributions_treasure_idx` ON `contributions` (`treasure_id`);--> statement-breakpoint
CREATE INDEX `contributions_gift_link_idx` ON `contributions` (`gift_link_id`);--> statement-breakpoint
CREATE INDEX `contributions_status_idx` ON `contributions` (`status`);--> statement-breakpoint
CREATE INDEX `contributions_created_at_idx` ON `contributions` (`created_at`);--> statement-breakpoint
CREATE TABLE `gift_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`design` text DEFAULT 'classic' NOT NULL,
	`treasure_id` text,
	`contribution_id` text,
	`status` text DEFAULT 'unassigned' NOT NULL,
	`note` text,
	`assigned_at` integer,
	`printed_at` integer,
	`redeemed_at` integer,
	`created_by_user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`treasure_id`) REFERENCES `treasures`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gift_cards_code_unique` ON `gift_cards` (`code`);--> statement-breakpoint
CREATE INDEX `gift_cards_status_idx` ON `gift_cards` (`status`);--> statement-breakpoint
CREATE INDEX `gift_cards_treasure_idx` ON `gift_cards` (`treasure_id`);--> statement-breakpoint
CREATE TABLE `gift_links` (
	`id` text PRIMARY KEY NOT NULL,
	`treasure_id` text NOT NULL,
	`token` text NOT NULL,
	`title` text NOT NULL,
	`message` text,
	`suggested_amounts_rial` text,
	`target_mg` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`expires_at` integer,
	`view_count` integer DEFAULT 0 NOT NULL,
	`created_by_user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`treasure_id`) REFERENCES `treasures`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gift_links_token_unique` ON `gift_links` (`token`);--> statement-breakpoint
CREATE INDEX `gift_links_treasure_idx` ON `gift_links` (`treasure_id`);--> statement-breakpoint
CREATE INDEX `gift_links_status_idx` ON `gift_links` (`status`);--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`personalization_id` text,
	`treasure_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`personalization_id`) REFERENCES `personalizations`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`treasure_id`) REFERENCES `treasures`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `cart_items_cart_id_idx` ON `cart_items` (`cart_id`);--> statement-breakpoint
CREATE TABLE `carts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`anon_token` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `carts_user_id_idx` ON `carts` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `carts_anon_token_unique` ON `carts` (`anon_token`);--> statement-breakpoint
CREATE INDEX `carts_status_idx` ON `carts` (`status`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`variant_id` text,
	`product_title` text NOT NULL,
	`variant_title` text NOT NULL,
	`sku` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`weight_mg` integer NOT NULL,
	`karat` integer NOT NULL,
	`gold_price_per_gram_rial` integer NOT NULL,
	`gold_value_rial` integer NOT NULL,
	`making_fee_bp` integer DEFAULT 0 NOT NULL,
	`making_fee_rial` integer DEFAULT 0 NOT NULL,
	`profit_bp` integer DEFAULT 0 NOT NULL,
	`profit_rial` integer DEFAULT 0 NOT NULL,
	`premium_rial` integer DEFAULT 0 NOT NULL,
	`packaging_rial` integer DEFAULT 0 NOT NULL,
	`personalization_rial` integer DEFAULT 0 NOT NULL,
	`vat_bp` integer DEFAULT 0 NOT NULL,
	`vat_rial` integer DEFAULT 0 NOT NULL,
	`unit_price_rial` integer NOT NULL,
	`line_total_rial` integer NOT NULL,
	`personalization_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`personalization_id`) REFERENCES `personalizations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`from_status` text,
	`to_status` text NOT NULL,
	`actor_user_id` text,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `order_status_history_order_idx` ON `order_status_history` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`subtotal_rial` integer NOT NULL,
	`discount_rial` integer DEFAULT 0 NOT NULL,
	`shipping_rial` integer DEFAULT 0 NOT NULL,
	`vat_rial` integer DEFAULT 0 NOT NULL,
	`total_rial` integer NOT NULL,
	`gold_total_mg` integer DEFAULT 0 NOT NULL,
	`gold_price_snapshot` text,
	`recipient_name` text NOT NULL,
	`recipient_phone` text NOT NULL,
	`shipping_address` text,
	`customer_note` text,
	`internal_note` text,
	`treasure_id` text,
	`placed_at` integer,
	`paid_at` integer,
	`cancelled_at` integer,
	`cancellation_reason` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`treasure_id`) REFERENCES `treasures`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE INDEX `orders_user_id_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orders_created_at_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `orders_treasure_idx` ON `orders` (`treasure_id`);--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`carrier` text,
	`tracking_code` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`cost_rial` integer DEFAULT 0 NOT NULL,
	`shipped_at` integer,
	`delivered_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `shipments_order_id_idx` ON `shipments` (`order_id`);--> statement-breakpoint
CREATE INDEX `shipments_status_idx` ON `shipments` (`status`);--> statement-breakpoint
CREATE TABLE `bank_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`bank_name` text NOT NULL,
	`card_number` text NOT NULL,
	`iban` text,
	`account_holder` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `bank_accounts_is_active_idx` ON `bank_accounts` (`is_active`);--> statement-breakpoint
CREATE TABLE `card_transfer_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_id` text NOT NULL,
	`reference_number` text NOT NULL,
	`paid_amount_rial` integer NOT NULL,
	`payer_name` text NOT NULL,
	`payer_card_last4` text,
	`bank_name` text,
	`paid_at` integer NOT NULL,
	`receipt_file_id` text,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`receipt_file_id`) REFERENCES `media_files`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `card_transfer_receipts_reference_unique` ON `card_transfer_receipts` (`reference_number`);--> statement-breakpoint
CREATE INDEX `card_transfer_receipts_payment_idx` ON `card_transfer_receipts` (`payment_id`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_number` text NOT NULL,
	`provider` text NOT NULL,
	`purpose` text NOT NULL,
	`order_id` text,
	`contribution_id` text,
	`payer_user_id` text,
	`amount_rial` integer NOT NULL,
	`bank_account_id` text,
	`status` text DEFAULT 'awaiting_transfer' NOT NULL,
	`expires_at` integer,
	`confirmed_at` integer,
	`rejected_at` integer,
	`rejection_reason` text,
	`reviewed_by_user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`payer_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_payment_number_unique` ON `payments` (`payment_number`);--> statement-breakpoint
CREATE INDEX `payments_status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `payments_order_idx` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `payments_contribution_idx` ON `payments` (`contribution_id`);--> statement-breakpoint
CREATE INDEX `payments_created_at_idx` ON `payments` (`created_at`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`link` text,
	`meta` text,
	`read_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_read_at_idx` ON `notifications` (`read_at`);--> statement-breakpoint
CREATE INDEX `notifications_created_at_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE TABLE `sms_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`template` text,
	`body` text NOT NULL,
	`provider` text NOT NULL,
	`provider_message_id` text,
	`status` text DEFAULT 'queued' NOT NULL,
	`error_message` text,
	`sent_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sms_messages_phone_idx` ON `sms_messages` (`phone`);--> statement-breakpoint
CREATE INDEX `sms_messages_status_idx` ON `sms_messages` (`status`);--> statement-breakpoint
CREATE INDEX `sms_messages_created_at_idx` ON `sms_messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `content_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`body_markdown` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_pages_slug_unique` ON `content_pages` (`slug`);--> statement-breakpoint
CREATE INDEX `content_pages_status_idx` ON `content_pages` (`status`);--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `faqs_is_active_idx` ON `faqs` (`is_active`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updated_at` integer NOT NULL
);
