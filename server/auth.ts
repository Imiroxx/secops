import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import crypto from "crypto";
import { pool, hasDbConnection } from "./db";
import { storage } from "./storage";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  };

  // Use Postgres session store only when a real database exists.
  // In dev without DATABASE_URL we fall back to in-memory store for stability.
  if (hasDbConnection && pool) {
    sessionSettings.store = new (pgSession(session))({
      pool,
      createTableIfMissing: true,
    });
  }

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Use Local Strategy (but adapted for Replit-style mock or just simple login)
  // Since we are using "Replit Auth" blueprint, normally it handles this. 
  // But if we want to stick to a simple implementation:
  
  // Actually, Replit Auth usually doesn't use passport-local with passwords if it's external auth.
  // But the "JavaScript Log In With Replit" blueprint often *replaces* this file.
  // If the blueprint runs, it might overwrite this.
  // I'll implement a basic LocalStrategy as fallback or placeholder.
  // Real Replit Auth uses headers (REPLIT_USER_ID, etc.) if inside Replit, 
  // OR standard OAuth if external.
  
  // For this "Lite" build, I'll assume we use the existing structure but allow 
  // any username to "login" if we want, or implementing a simple register/login.
  
  // However, the user asked for "Registration".
  // So I'll implement standard Local Auth for now, as it's most reliable without 
  // complex external callbacks in this environment.

  function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16);
    const derived = crypto.scryptSync(password, salt, 64);
    return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
  }

  function verifyPassword(password: string, stored: string | null | undefined): boolean {
    if (!stored) return false;
    if (!stored.startsWith("scrypt$")) {
      // Backward-compat for old plain-text dev users.
      return stored === password;
    }
    const parts = stored.split("$");
    if (parts.length !== 3) return false;
    const salt = Buffer.from(parts[1], "hex");
    const expected = Buffer.from(parts[2], "hex");
    const derived = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(expected, derived);
  }

  function sanitizeUser(user: any) {
    if (!user || typeof user !== "object") return user;
    const { password, ...rest } = user;
    return rest;
  }

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !verifyPassword(password, (user as any).password)) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, sanitizeUser(user));
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, (user as any).id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const username = String(req.body.username || "").trim();
      const password = String(req.body.password || "");
      const email = req.body.email ? String(req.body.email).trim() : undefined;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser({
        username,
        email,
        password: hashPassword(password),
      } as any);
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(sanitizeUser(user));
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(sanitizeUser(user));
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session?.destroy(() => {
        res.clearCookie("connect.sid");
        res.sendStatus(200);
      });
    });
  });
}
