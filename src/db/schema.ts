import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  integer,
  real,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const genId = () => crypto.randomUUID();

export const users = pgTable("users", {
  id: uuid("id").primaryKey().$defaultFn(genId),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  collegeId: text("college_id").notNull(),
  department: text("department").notNull(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  ratingAvg: real("rating_avg").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().$defaultFn(genId),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lostItems = pgTable("lost_items", {
  id: uuid("id").primaryKey().$defaultFn(genId),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  dateLost: date("date_lost").notNull(),
  photoUrl: text("photo_url"),
  status: text("status").notNull().default("open"), // open | matched | resolved
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const foundItems = pgTable("found_items", {
  id: uuid("id").primaryKey().$defaultFn(genId),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  dateFound: date("date_found").notNull(),
  photoUrl: text("photo_url"),
  verificationQuestion: text("verification_question").notNull(),
  verificationAnswer: text("verification_answer").notNull(),
  status: text("status").notNull().default("open"), // open | matched | resolved
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().$defaultFn(genId),
  lostItemId: uuid("lost_item_id")
    .notNull()
    .references(() => lostItems.id, { onDelete: "cascade" }),
  foundItemId: uuid("found_item_id")
    .notNull()
    .references(() => foundItems.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending | verified | rejected
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
});

export const borrowListings = pgTable("borrow_listings", {
  id: uuid("id").primaryKey().$defaultFn(genId),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  availableFrom: date("available_from").notNull(),
  availableTo: date("available_to").notNull(),
  status: text("status").notNull().default("available"), // available | lent | unavailable
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const borrowRequests = pgTable("borrow_requests", {
  id: uuid("id").primaryKey().$defaultFn(genId),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => borrowListings.id, { onDelete: "cascade" }),
  borrowerId: uuid("borrower_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  borrowDate: date("borrow_date").notNull(),
  returnDate: date("return_date").notNull(),
  status: text("status").notNull().default("pending"), // pending | accepted | rejected | returned | cancelled
  message: text("message"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  returnedAt: timestamp("returned_at", { withTimezone: true }),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().$defaultFn(genId),
  userOneId: uuid("user_one_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userTwoId: uuid("user_two_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contextType: text("context_type"), // lost | found | borrow | null
  contextId: uuid("context_id"),
  contextLabel: text("context_label"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().$defaultFn(genId),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp("read_at", { withTimezone: true }),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().$defaultFn(genId),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().$defaultFn(genId),
    raterId: uuid("rater_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ratedUserId: uuid("rated_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    borrowRequestId: uuid("borrow_request_id").references(() => borrowRequests.id, {
      onDelete: "cascade",
    }),
    stars: integer("stars").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("rating_unique_idx").on(table.raterId, table.borrowRequestId)],
);
