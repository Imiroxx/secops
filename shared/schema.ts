import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

// === TABLE DEFINITIONS ===

// Session storage table (Mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Users table (Updated for Replit Auth and Password support)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  password: text("password"), // Optional if using OIDC, required for local
  isAdmin: boolean("is_admin").default(false),
  profileImageUrl: text("profile_image_url"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scans table - stores the analysis results
export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  target: text("target").notNull(),
  scanType: text("scan_type").notNull(),
  result: jsonb("result").notNull(),
  vulnerabilityCount: integer("vulnerability_count").default(0),
  isSafe: boolean("is_safe").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Progress table for Courses
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at").defaultNow(),
}, (table) => ({
  userCourseLessonIndex: index("user_course_lesson_idx").on(table.userId, table.courseId, table.lessonId),
}));

// Arena Sessions table for Docker challenges
export const arenaSessions = pgTable("arena_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: text("challenge_id").notNull(),
  containerId: text("container_id"),
  port: integer("port"),
  status: text("status").notNull().default("starting"), // starting, active, stopped, completed
  flag: text("flag"),
  isSolved: boolean("is_solved").default(false),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
});

// Lesson Comments table
export const lessonComments = pgTable("lesson_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: text("lesson_id").notNull(),
  courseId: integer("course_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Settings table
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  bio: text("bio"),
  specialization: text("specialization"),
  githubUrl: text("github_url"),
  websiteUrl: text("website_url"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === RELATIONS ===
export const scansRelations = relations(scans, ({ one }) => ({
  user: one(users, {
    fields: [scans.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  scans: many(scans),
  progress: many(userProgress),
  arenaSessions: many(arenaSessions),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

export const arenaSessionsRelations = relations(arenaSessions, ({ one }) => ({
  user: one(users, {
    fields: [arenaSessions.userId],
    references: [users.id],
  }),
}));

export const lessonCommentsRelations = relations(lessonComments, ({ one }) => ({
  user: one(users, {
    fields: [lessonComments.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// === SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, isAdmin: true });
export const insertScanSchema = createInsertSchema(scans).omit({ id: true, createdAt: true, userId: true, result: true, vulnerabilityCount: true, isSafe: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, completedAt: true });
export const insertArenaSessionSchema = createInsertSchema(arenaSessions).omit({ id: true, startTime: true });
export const insertLessonCommentSchema = createInsertSchema(lessonComments).omit({ id: true, createdAt: true });
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true, updatedAt: true });

// Input schema for the scan API
export const scanRequestSchema = z.object({
  target: z.string().min(1, "Input is required"),
  scanType: z.enum(["sql_injection", "general", "code_review"]).default("general"),
});

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type ArenaSession = typeof arenaSessions.$inferSelect;
export type InsertArenaSession = z.infer<typeof insertArenaSessionSchema>;
export type ScanRequest = z.infer<typeof scanRequestSchema>;

// Type for the Analysis Result stored in JSONB
export interface Vulnerability {
  type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  remediation: string;
  impact?: string;
  evidence?: string;
  references?: string[];
}

export interface AnalysisResult {
  summary: string;
  vulnerabilities: Vulnerability[];
  isSafe: boolean;
  recommendations?: string[];
}

// Stats response type
export interface StatsResponse {
  totalScans: number;
  safeScans: number;
  vulnerabilitiesByType: Record<string, number>;
  scansOverTime: { date: string; count: number }[];
}
