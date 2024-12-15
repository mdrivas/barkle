import {
  relations,
  sql,
  type InferSelectModel,
  type InferInsertModel,
} from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  image: varchar("image", { length: 255 }),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export const profiles = createTable("profile", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .unique(),
  username: varchar("username", { length: 30 }).unique(),
  tempId: varchar("temp_id", { length: 255 }).unique().$type<string | null>(),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  currentDailyStreak: integer("current_daily_streak").default(0),
  highestDailyStreak: integer("highest_daily_streak").default(0),
  currentGuessStreak: integer("current_guess_streak").default(0),
  highestGuessStreak: integer("highest_guess_streak").default(0),
  lastPlayedAt: timestamp("last_played_at", { withTimezone: true }),
  highestPawsistenceStreak: integer("highest_pawsistence_streak").default(0),
  pawsistencePlaysToday: integer("pawsistence_plays_today").default(0),
  lastPawsistenceAt: timestamp("last_pawsistence_at", { withTimezone: true }),
});

export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const scores = createTable("scores", {
  id: serial("id").primaryKey(),
  score: integer("score").notNull(),
  results: text("results"),
  userId: varchar("user_id", { length: 255 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  tempId: varchar("temp_id", { length: 255 }),
  playedAt: timestamp("played_at", { withTimezone: true }),
});

export const dailyBreeds = createTable("daily_breeds", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(),
  breeds: text("breeds").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type DailyBreeds = InferSelectModel<typeof dailyBreeds>;
export type NewDailyBreeds = InferInsertModel<typeof dailyBreeds>;

export const dogSubmissions = createTable("dog_submission", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  breed: varchar("breed", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending' | 'verified' | 'rejected'
  imagePath: varchar("image_path", { length: 255 }).notNull(), // Store just the path/filename
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  verifiedBy: varchar("verified_by", { length: 255 }).references(
    () => users.id,
    { onDelete: "set null" },
  ),
  lastFeaturedAt: timestamp("last_featured_at"),
});

// Add relations
export const dogSubmissionsRelations = relations(dogSubmissions, ({ one }) => ({
  profile: one(profiles, {
    fields: [dogSubmissions.userId],
    references: [profiles.userId],
  }),
  verifier: one(users, {
    fields: [dogSubmissions.verifiedBy],
    references: [users.id],
  }),
}));
