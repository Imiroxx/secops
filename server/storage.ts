import { db, hasDbConnection } from "./db";
import {
  users, scans,
  type User, type InsertUser,
  type Scan, type InsertScan, type AnalysisResult
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Scan operations
  createScan(scan: InsertScan & { userId?: number | null, result: AnalysisResult, vulnerabilityCount: number, isSafe: boolean }): Promise<Scan>;
  getScansByUser(userId: number): Promise<Scan[]>;
  getScan(id: number): Promise<Scan | undefined>;
  getStats(userId: number): Promise<{
    totalScans: number;
    safeScans: number;
    vulnerabilitiesByType: Record<string, number>;
    scansOverTime: { date: string; count: number }[];
  }>;

  // Progress operations
  getProgress(userId: number, courseId: number): Promise<UserProgress[]>;
  updateProgress(userId: number, courseId: number, lessonId: string, completed: boolean): Promise<UserProgress>;

  // Arena operations
  getArenaSessions(userId: number): Promise<ArenaSession[]>;
  createArenaSession(session: InsertArenaSession & { userId: number }): Promise<ArenaSession>;
  updateArenaSession(id: number, update: Partial<ArenaSession>): Promise<ArenaSession>;

  // Comment operations
  getComments(courseId: number, lessonId: string): Promise<(typeof lessonComments.$inferSelect & { user: typeof users.$inferSelect })[]>;
  addComment(userId: number, courseId: number, lessonId: string, content: string): Promise<typeof lessonComments.$inferSelect>;

  // User Settings operations
  getUserSettings(userId: number): Promise<typeof userSettings.$inferSelect | undefined>;
  updateUserSettings(userId: number, update: Partial<typeof userSettings.$inferInsert>): Promise<typeof userSettings.$inferSelect>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    if (!db) throw new Error("Database not connected");
    const result = await db.select().from(users).where(eq(users.id, id));
    if (Array.isArray(result)) {
      return result[0];
    } else if (result && typeof result === 'object') {
      return result;
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      if (!db) throw new Error("Database not connected");
      const result = await db.select().from(users).where(eq(users.username, username));
      return Array.isArray(result) && result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(users).values(insertUser).returning();
    if (Array.isArray(result)) {
      return result[0];
    } else if (result && typeof result === 'object') {
      return result;
    }
    throw new Error('Failed to create user');
  }

  async createScan(scan: InsertScan & { userId?: number | null, result: AnalysisResult, vulnerabilityCount: number, isSafe: boolean }): Promise<Scan> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(scans).values(scan).returning();
    if (Array.isArray(result)) {
      return result[0];
    } else if (result && typeof result === 'object') {
      return result;
    }
    throw new Error('Failed to create scan');
  }

  async getScansByUser(userId: number): Promise<Scan[]> {
    if (!db) throw new Error("Database not connected");
    return await db.select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt));
  }

  async getScan(id: number): Promise<Scan | undefined> {
    if (!db) throw new Error("Database not connected");
    const result = await db.select().from(scans).where(eq(scans.id, id));
    if (Array.isArray(result)) {
      return result[0];
    } else if (result && typeof result === 'object') {
      return result;
    }
    return undefined;
  }

  async getStats(userId: number): Promise<{
    totalScans: number;
    safeScans: number;
    vulnerabilitiesByType: Record<string, number>;
    scansOverTime: { date: string; count: number }[];
  }> {
    const userScans = await this.getScansByUser(userId);

    const totalScans = userScans.length;
    const safeScans = userScans.filter(s => s.isSafe).length;
    
    const vulnerabilitiesByType: Record<string, number> = {};
    const scansOverTimeMap: Record<string, number> = {};

    userScans.forEach(scan => {
      // Aggregate vulnerabilities
      const result = scan.result as AnalysisResult;
      result.vulnerabilities.forEach(v => {
        vulnerabilitiesByType[v.type] = (vulnerabilitiesByType[v.type] || 0) + 1;
      });

      // Aggregate timeline (by date)
      if (scan.createdAt) {
        const date = scan.createdAt.toISOString().split('T')[0];
        scansOverTimeMap[date] = (scansOverTimeMap[date] || 0) + 1;
      }
    });

    const scansOverTime = Object.entries(scansOverTimeMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalScans,
      safeScans,
      vulnerabilitiesByType,
      scansOverTime
    };
  }

  // Progress operations
  async getProgress(userId: number, courseId: number): Promise<UserProgress[]> {
    if (!db) throw new Error("Database not connected");
    return await db.select().from(userProgress)
      .where(sql`${userProgress.userId} = ${userId} AND ${userProgress.courseId} = ${courseId}`);
  }

  async updateProgress(userId: number, courseId: number, lessonId: string, completed: boolean): Promise<UserProgress> {
    if (!db) throw new Error("Database not connected");
    const existing = await db.select().from(userProgress)
      .where(sql`${userProgress.userId} = ${userId} AND ${userProgress.courseId} = ${courseId} AND ${userProgress.lessonId} = ${lessonId}`);
    
    if (existing.length > 0) {
      const result = await db.update(userProgress)
        .set({ completed, completedAt: new Date() })
        .where(eq(userProgress.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userProgress)
        .values({ userId, courseId, lessonId, completed })
        .returning();
      return result[0];
    }
  }

  // Arena operations
  async getArenaSessions(userId: number): Promise<ArenaSession[]> {
    if (!db) throw new Error("Database not connected");
    return await db.select().from(arenaSessions)
      .where(eq(arenaSessions.userId, userId))
      .orderBy(desc(arenaSessions.startTime));
  }

  async createArenaSession(session: InsertArenaSession & { userId: number }): Promise<ArenaSession> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(arenaSessions).values(session).returning();
    return result[0];
  }

  async updateArenaSession(id: number, update: Partial<ArenaSession>): Promise<ArenaSession> {
    if (!db) throw new Error("Database not connected");
    const result = await db.update(arenaSessions)
      .set(update)
      .where(eq(arenaSessions.id, id))
      .returning();
    return result[0];
  }

  // Comment operations
  async getComments(courseId: number, lessonId: string): Promise<(typeof lessonComments.$inferSelect & { user: typeof users.$inferSelect })[]> {
    if (!db) throw new Error("Database not connected");
    return await db.select()
      .from(lessonComments)
      .innerJoin(users, eq(lessonComments.userId, users.id))
      .where(sql`${lessonComments.courseId} = ${courseId} AND ${lessonComments.lessonId} = ${lessonId}`)
      .orderBy(desc(lessonComments.createdAt))
      .then(rows => rows.map(r => ({ ...r.lesson_comments, user: r.users })));
  }

  async addComment(userId: number, courseId: number, lessonId: string, content: string): Promise<typeof lessonComments.$inferSelect> {
    if (!db) throw new Error("Database not connected");
    const result = await db.insert(lessonComments)
      .values({ userId, courseId, lessonId, content })
      .returning();
    return result[0];
  }

  // User Settings operations
  async getUserSettings(userId: number): Promise<typeof userSettings.$inferSelect | undefined> {
    if (!db) throw new Error("Database not connected");
    const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return result[0];
  }

  async updateUserSettings(userId: number, update: Partial<typeof userSettings.$inferInsert>): Promise<typeof userSettings.$inferSelect> {
    if (!db) throw new Error("Database not connected");
    const existing = await this.getUserSettings(userId);
    if (existing) {
      const result = await db.update(userSettings)
        .set({ ...update, updatedAt: new Date() })
        .where(eq(userSettings.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userSettings)
        .values({ ...update, userId } as any)
        .returning();
      return result[0];
    }
  }
}

export class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private scans: Scan[] = [];
  private nextUserId = 1;
  private nextScanId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const user: User = {
      id: this.nextUserId++,
      username: insertUser.username,
      email: insertUser.email ?? null,
      password: (insertUser as any).password ?? null,
      isAdmin: (insertUser as any).isAdmin ?? false,
      profileImageUrl: (insertUser as any).profileImageUrl ?? null,
      firstName: (insertUser as any).firstName ?? null,
      lastName: (insertUser as any).lastName ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(user);
    return user;
  }

  async createScan(
    scan: InsertScan & {
      userId?: number | null;
      result: AnalysisResult;
      vulnerabilityCount: number;
      isSafe: boolean;
    },
  ): Promise<Scan> {
    const now = new Date();
    const newScan: Scan = {
      id: this.nextScanId++,
      userId: scan.userId ?? null,
      target: scan.target,
      scanType: scan.scanType,
      result: scan.result,
      vulnerabilityCount: scan.vulnerabilityCount ?? 0,
      isSafe: scan.isSafe ?? false,
      createdAt: now,
    };

    this.scans.push(newScan);
    return newScan;
  }

  async getScansByUser(userId: number): Promise<Scan[]> {
    return this.scans
      .filter((s) => s.userId === userId)
      .sort((a, b) => {
        const ad = a.createdAt?.getTime() ?? 0;
        const bd = b.createdAt?.getTime() ?? 0;
        return bd - ad;
      });
  }

  async getScan(id: number): Promise<Scan | undefined> {
    return this.scans.find((s) => s.id === id);
  }

  async getStats(userId: number): Promise<{
    totalScans: number;
    safeScans: number;
    vulnerabilitiesByType: Record<string, number>;
    scansOverTime: { date: string; count: number }[];
  }> {
    const userScans = await this.getScansByUser(userId);

    const totalScans = userScans.length;
    const safeScans = userScans.filter((s) => s.isSafe).length;
    const vulnerabilitiesByType: Record<string, number> = {};
    const scansOverTimeMap: Record<string, number> = {};

    for (const scan of userScans) {
      const result = scan.result as AnalysisResult;
      for (const v of result.vulnerabilities) {
        vulnerabilitiesByType[v.type] = (vulnerabilitiesByType[v.type] ?? 0) + 1;
      }

      if (scan.createdAt) {
        const date = scan.createdAt.toISOString().split("T")[0];
        scansOverTimeMap[date] = (scansOverTimeMap[date] ?? 0) + 1;
      }
    }

    const scansOverTime = Object.entries(scansOverTimeMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalScans,
      safeScans,
      vulnerabilitiesByType,
      scansOverTime,
    };
  }

  // Progress operations
  private progress: UserProgress[] = [];
  async getProgress(userId: number, courseId: number): Promise<UserProgress[]> {
    return this.progress.filter(p => p.userId === userId && p.courseId === courseId);
  }

  async updateProgress(userId: number, courseId: number, lessonId: string, completed: boolean): Promise<UserProgress> {
    const idx = this.progress.findIndex(p => p.userId === userId && p.courseId === courseId && p.lessonId === lessonId);
    if (idx >= 0) {
      this.progress[idx] = { ...this.progress[idx], completed, completedAt: new Date() };
      return this.progress[idx];
    } else {
      const newP: UserProgress = {
        id: this.progress.length + 1,
        userId,
        courseId,
        lessonId,
        completed,
        completedAt: new Date()
      };
      this.progress.push(newP);
      return newP;
    }
  }

  // Arena operations
  private arena: ArenaSession[] = [];
  async getArenaSessions(userId: number): Promise<ArenaSession[]> {
    return this.arena.filter(s => s.userId === userId).sort((a,b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0));
  }

  async createArenaSession(session: InsertArenaSession & { userId: number }): Promise<ArenaSession> {
    const newS: ArenaSession = {
      id: this.arena.length + 1,
      userId: session.userId,
      challengeId: session.challengeId,
      containerId: session.containerId ?? null,
      port: session.port ?? null,
      status: session.status ?? 'starting',
      flag: session.flag ?? null,
      isSolved: session.isSolved ?? false,
      startTime: new Date(),
      endTime: null
    };
    this.arena.push(newS);
    return newS;
  }

  async updateArenaSession(id: number, update: Partial<ArenaSession>): Promise<ArenaSession> {
    const idx = this.arena.findIndex(s => s.id === id);
    if (idx < 0) throw new Error("Session not found");
    this.arena[idx] = { ...this.arena[idx], ...update };
    return this.arena[idx];
  }
}

export const storage: IStorage = hasDbConnection ? new DatabaseStorage() : new InMemoryStorage();
