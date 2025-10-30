CREATE TABLE `active_workout_session` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_template_id` text NOT NULL,
	`start_time` integer NOT NULL,
	`date` text NOT NULL,
	`sets` text NOT NULL,
	FOREIGN KEY (`workout_template_id`) REFERENCES `workout_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`activity` text NOT NULL,
	`calories` integer NOT NULL,
	`type` text NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_nutrition` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`protein` real NOT NULL,
	`carbs` real NOT NULL,
	`fat` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercise_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`default_set_targets` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `food_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`food_id` text NOT NULL,
	`date` text NOT NULL,
	`meal_type` text NOT NULL,
	`quantity` real NOT NULL,
	`unit` text NOT NULL,
	`total_calories` real NOT NULL,
	`total_protein` real NOT NULL,
	`total_carbs` real NOT NULL,
	`total_fat` real NOT NULL,
	`total_fiber` real NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `food_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_food_entries_date` ON `food_entries` (`date`);--> statement-breakpoint
CREATE INDEX `idx_food_entries_meal_type` ON `food_entries` (`meal_type`);--> statement-breakpoint
CREATE TABLE `food_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brand` text,
	`barcode` text,
	`category` text NOT NULL,
	`calories` real NOT NULL,
	`protein` real NOT NULL,
	`carbs` real NOT NULL,
	`fat` real NOT NULL,
	`fiber` real NOT NULL,
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
	`serving_size` real NOT NULL,
	`serving_unit` text NOT NULL,
	`is_verified` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_food_items_name` ON `food_items` (`name`);--> statement-breakpoint
CREATE INDEX `idx_food_items_category` ON `food_items` (`category`);--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`food_id` text NOT NULL,
	`quantity` real NOT NULL,
	`unit` text NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`food_id`) REFERENCES `food_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`instructions` text,
	`servings` integer NOT NULL,
	`prep_time` integer,
	`cook_time` integer,
	`calories_per_serving` real NOT NULL,
	`protein_per_serving` real NOT NULL,
	`carbs_per_serving` real NOT NULL,
	`fat_per_serving` real NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`birthdate` text NOT NULL,
	`gender` text NOT NULL,
	`height` real NOT NULL,
	`weight` real NOT NULL,
	`activity_level` text NOT NULL,
	`goal_type` text NOT NULL,
	`target_weight` real,
	`target_calories` real NOT NULL,
	`target_protein` real NOT NULL,
	`target_carbs` real NOT NULL,
	`target_fat` real NOT NULL,
	`target_vitamin_a` real,
	`target_vitamin_c` real,
	`target_vitamin_d` real,
	`target_vitamin_b6` real,
	`target_vitamin_e` real,
	`target_vitamin_k` real,
	`target_thiamin` real,
	`target_vitamin_b12` real,
	`target_riboflavin` real,
	`target_folate` real,
	`target_niacin` real,
	`target_choline` real,
	`target_pantothenic_acid` real,
	`target_biotin` real,
	`target_carotenoids` real,
	`target_calcium` real,
	`target_chloride` real,
	`target_chromium` real,
	`target_copper` real,
	`target_fluoride` real,
	`target_iodine` real,
	`target_iron` real,
	`target_magnesium` real,
	`target_manganese` real,
	`target_molybdenum` real,
	`target_phosphorus` real,
	`target_potassium` real,
	`target_selenium` real,
	`target_sodium` real,
	`target_zinc` real,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weight_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`weight` real NOT NULL,
	`date` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_weight_entries_date` ON `weight_entries` (`date`);--> statement-breakpoint
CREATE TABLE `workout_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_template_id` text NOT NULL,
	`date` text NOT NULL,
	`duration` integer NOT NULL,
	`sets` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`workout_template_id`) REFERENCES `workout_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_workout_entries_date` ON `workout_entries` (`date`);--> statement-breakpoint
CREATE TABLE `workout_template_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_template_id` text NOT NULL,
	`exercise_template_id` text NOT NULL,
	`set_targets` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`workout_template_id`) REFERENCES `workout_templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_template_id`) REFERENCES `exercise_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workout_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
