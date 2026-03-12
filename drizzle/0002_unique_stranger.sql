CREATE TABLE `meal_log_items` (
	`id` text PRIMARY KEY NOT NULL,
	`meal_log_id` text NOT NULL,
	`food_entry_id` text,
	`food_id` text,
	`entry_type` text NOT NULL,
	`title` text NOT NULL,
	`quantity` real NOT NULL,
	`unit` text NOT NULL,
	`total_calories` real NOT NULL,
	`total_protein` real NOT NULL,
	`total_carbs` real NOT NULL,
	`total_fat` real NOT NULL,
	`total_fiber` real NOT NULL,
	`vitamin_a` real DEFAULT 0,
	`vitamin_c` real DEFAULT 0,
	`vitamin_d` real DEFAULT 0,
	`vitamin_b6` real DEFAULT 0,
	`vitamin_e` real DEFAULT 0,
	`vitamin_k` real DEFAULT 0,
	`thiamin` real DEFAULT 0,
	`vitamin_b12` real DEFAULT 0,
	`riboflavin` real DEFAULT 0,
	`folate` real DEFAULT 0,
	`niacin` real DEFAULT 0,
	`choline` real DEFAULT 0,
	`pantothenic_acid` real DEFAULT 0,
	`biotin` real DEFAULT 0,
	`carotenoids` real DEFAULT 0,
	`calcium` real DEFAULT 0,
	`chloride` real DEFAULT 0,
	`chromium` real DEFAULT 0,
	`copper` real DEFAULT 0,
	`fluoride` real DEFAULT 0,
	`iodine` real DEFAULT 0,
	`iron` real DEFAULT 0,
	`magnesium` real DEFAULT 0,
	`manganese` real DEFAULT 0,
	`molybdenum` real DEFAULT 0,
	`phosphorus` real DEFAULT 0,
	`potassium` real DEFAULT 0,
	`selenium` real DEFAULT 0,
	`sodium` real DEFAULT 0,
	`zinc` real DEFAULT 0,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`meal_log_id`) REFERENCES `meal_logs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`food_entry_id`) REFERENCES `food_entries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`food_id`) REFERENCES `food_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_meal_log_items_meal_log_id` ON `meal_log_items` (`meal_log_id`);--> statement-breakpoint
CREATE INDEX `idx_meal_log_items_food_entry_id` ON `meal_log_items` (`food_entry_id`);--> statement-breakpoint
CREATE INDEX `idx_meal_log_items_food_id` ON `meal_log_items` (`food_id`);--> statement-breakpoint
CREATE TABLE `meal_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`meal_type` text NOT NULL,
	`title` text NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text,
	`total_calories` real NOT NULL,
	`total_protein` real NOT NULL,
	`total_carbs` real NOT NULL,
	`total_fat` real NOT NULL,
	`total_fiber` real NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_meal_logs_date` ON `meal_logs` (`date`);--> statement-breakpoint
CREATE INDEX `idx_meal_logs_meal_type` ON `meal_logs` (`meal_type`);--> statement-breakpoint
CREATE INDEX `idx_meal_logs_source_type` ON `meal_logs` (`source_type`);--> statement-breakpoint
CREATE TABLE `saved_meal_items` (
	`id` text PRIMARY KEY NOT NULL,
	`saved_meal_id` text NOT NULL,
	`food_id` text NOT NULL,
	`quantity` real NOT NULL,
	`unit` text NOT NULL,
	`item_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`saved_meal_id`) REFERENCES `saved_meals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`food_id`) REFERENCES `food_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_saved_meal_items_saved_meal_id` ON `saved_meal_items` (`saved_meal_id`);--> statement-breakpoint
CREATE INDEX `idx_saved_meal_items_food_id` ON `saved_meal_items` (`food_id`);--> statement-breakpoint
CREATE TABLE `saved_meals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`default_meal_type` text NOT NULL,
	`notes` text,
	`is_favorite` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_saved_meals_name` ON `saved_meals` (`name`);--> statement-breakpoint
CREATE INDEX `idx_saved_meals_default_meal_type` ON `saved_meals` (`default_meal_type`);--> statement-breakpoint
CREATE TABLE `target_micro_nutrients` (
	`id` text PRIMARY KEY NOT NULL,
	`vitamin_a` real DEFAULT 0,
	`vitamin_c` real DEFAULT 0,
	`vitamin_d` real DEFAULT 0,
	`vitamin_b6` real DEFAULT 0,
	`vitamin_e` real DEFAULT 0,
	`vitamin_k` real DEFAULT 0,
	`thiamin` real DEFAULT 0,
	`vitamin_b12` real DEFAULT 0,
	`riboflavin` real DEFAULT 0,
	`folate` real DEFAULT 0,
	`niacin` real DEFAULT 0,
	`choline` real DEFAULT 0,
	`pantothenic_acid` real DEFAULT 0,
	`biotin` real DEFAULT 0,
	`carotenoids` real DEFAULT 0,
	`calcium` real DEFAULT 0,
	`chloride` real DEFAULT 0,
	`chromium` real DEFAULT 0,
	`copper` real DEFAULT 0,
	`fluoride` real DEFAULT 0,
	`iodine` real DEFAULT 0,
	`iron` real DEFAULT 0,
	`magnesium` real DEFAULT 0,
	`manganese` real DEFAULT 0,
	`molybdenum` real DEFAULT 0,
	`phosphorus` real DEFAULT 0,
	`potassium` real DEFAULT 0,
	`selenium` real DEFAULT 0,
	`sodium` real DEFAULT 0,
	`zinc` real DEFAULT 0,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `food_entries` ADD `meal_log_id` text REFERENCES meal_logs(id);--> statement-breakpoint
CREATE INDEX `idx_food_entries_meal_log_id` ON `food_entries` (`meal_log_id`);--> statement-breakpoint
ALTER TABLE `food_items` ADD `source_type` text DEFAULT 'product' NOT NULL;