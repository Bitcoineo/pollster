import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";
// =============================================================================
// AUTH TABLES — column names must match @auth/drizzle-adapter exactly.
// See: node_modules/@auth/drizzle-adapter/src/lib/sqlite.ts
//
// Key quirks from the adapter:
//   - Table names are SINGULAR: "user", "account", "session", "verificationToken"
//   - accounts has NO id column — composite PK on (provider, providerAccountId)
//   - sessions uses sessionToken as PK — no separate id
//   - Mixed naming: camelCase (userId, sessionToken) + snake_case (refresh_token)
//   - Timestamps use mode: "timestamp_ms" (milliseconds), not "timestamp" (seconds)
// =============================================================================

type AdapterAccountType = "oauth" | "oidc" | "email" | "webauthn";

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  hashedPassword: text("hashedPassword"), // null for OAuth-only users
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ]
);

// =============================================================================
// APP TABLES
// =============================================================================

export type PollStatus = "open" | "closed";

export const polls = sqliteTable(
  "poll",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    slug: text("slug").notNull().unique(),
    status: text("status", { enum: ["open", "closed"] })
      .notNull()
      .default("open"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    uniqueIndex("polls_slug_idx").on(table.slug),
    index("polls_user_id_idx").on(table.userId),
  ]
);

export const options = sqliteTable(
  "option",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pollId: text("pollId")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    position: integer("position").notNull(),
  },
  (table) => [index("options_poll_id_idx").on(table.pollId)]
);

export const votes = sqliteTable(
  "vote",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pollId: text("pollId")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    optionId: text("optionId")
      .notNull()
      .references(() => options.id, { onDelete: "cascade" }),
    voterIp: text("voterIp").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    uniqueIndex("votes_poll_ip_idx").on(table.pollId, table.voterIp),
    index("votes_option_id_idx").on(table.optionId),
  ]
);
