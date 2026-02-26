CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `option` (
	`id` text PRIMARY KEY NOT NULL,
	`pollId` text NOT NULL,
	`text` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`pollId`) REFERENCES `poll`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `options_poll_id_idx` ON `option` (`pollId`);--> statement-breakpoint
CREATE TABLE `poll` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`question` text NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `poll_slug_unique` ON `poll` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `polls_slug_idx` ON `poll` (`slug`);--> statement-breakpoint
CREATE INDEX `polls_user_id_idx` ON `poll` (`userId`);--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text,
	`hashedPassword` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE TABLE `vote` (
	`id` text PRIMARY KEY NOT NULL,
	`pollId` text NOT NULL,
	`optionId` text NOT NULL,
	`voterIp` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`pollId`) REFERENCES `poll`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`optionId`) REFERENCES `option`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `votes_poll_ip_idx` ON `vote` (`pollId`,`voterIp`);--> statement-breakpoint
CREATE INDEX `votes_option_id_idx` ON `vote` (`optionId`);