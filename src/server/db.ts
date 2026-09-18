import crypto from "crypto";
import type { Candidate, Program, Cycle, Snapshot } from "@/lib/schema";
import {
  demoCandidate,
  demoPrograms,
  defaultCycle,
  emptyCandidate,
} from "./seed";
import {
  diagnose,
  completeness,
  match,
  pathways,
  tasks,
  audit,
} from "./domain";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  is_demo: boolean;
}

export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: number;
}

export interface DocumentBlob {
  id: string;
  candidateId: string;
  mime: string;
  content: Buffer;
  sha256: string;
}

// Global in-memory storage persisted across requests in this Node process
class DatabaseStore {
  users = new Map<string, UserRecord>();
  candidates = new Map<string, Candidate>();
  sessions = new Map<string, SessionRecord>();
  programs: Program[] = [];
  cycles = new Map<string, Cycle>();
  documents = new Map<string, DocumentBlob>();
  initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Seed default cycle
    const cycle = defaultCycle();
    this.cycles.set(cycle.id, cycle);

    // Seed demo programs
    this.programs = demoPrograms();
  }

  hashPassword(password: string, saltHex?: string): string {
    const salt = saltHex || crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .scryptSync(password, Buffer.from(salt, "hex"), 64, {
        N: 16384,
        r: 8,
        p: 1,
      })
      .toString("hex");
    return `scrypt$${salt}$${hash}`;
  }

  verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split("$");
    if (parts.length !== 3) return false;
    const [, salt, expectedHash] = parts;
    const calculated = crypto
      .scryptSync(password, Buffer.from(salt, "hex"), 64, {
        N: 16384,
        r: 8,
        p: 1,
      })
      .toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(calculated, "hex"),
      Buffer.from(expectedHash, "hex"),
    );
  }

  createSession(userId: string): { token: string; expiresAt: Date } {
    const token = crypto.randomBytes(36).toString("base64url");
    const expiresAt = Date.now() + 12 * 3600 * 1000;
    this.sessions.set(token, { token, userId, expiresAt });
    return { token, expiresAt: new Date(expiresAt) };
  }

  getSessionUser(token: string | null | undefined): Candidate | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session || session.expiresAt <= Date.now()) {
      if (session) this.sessions.delete(token);
      return null;
    }
    return this.candidates.get(session.userId) || null;
  }

  deleteSession(token: string) {
    this.sessions.delete(token);
  }

  getPrograms(c: Candidate): Program[] {
    const progs = this.programs.map((p) => {
      const copy = JSON.parse(JSON.stringify(p)) as Program;
      if (c.overrides && c.overrides[p.id]) {
        Object.assign(copy.claims, c.overrides[p.id]);
      }
      return copy;
    });
    return progs;
  }

  getCycle(c: Candidate): Cycle {
    if (c.cycle) return c.cycle;
    return this.cycles.get("MA-EEF-reference-2026") || defaultCycle();
  }

  snapshot(c: Candidate): Snapshot {
    const progs = this.getPrograms(c);
    const diag = diagnose(c);
    const cycle = this.getCycle(c);
    return {
      candidate: c,
      programs: progs,
      completeness: completeness(c),
      diagnostic: diag,
      matches: progs.map((p) => match(c, p, diag)),
      pathways: pathways(c),
      tasks: tasks(c, progs, cycle),
      audit: audit(c, progs, cycle),
      cycle,
    };
  }

  persist(c: Candidate, action: string, invalidate = true): Snapshot {
    if (invalidate) {
      c.revision += 1;
      if (action !== "narrative.saved") {
        c.narrative.approved = false;
      }
      for (const a of c.artifacts) {
        a.approved = false;
      }
    }
    this.candidates.set(c.id, c);
    return this.snapshot(c);
  }

  createDemo(): { candidate: Candidate; token: string; expiresAt: Date } {
    this.init();
    const cid = crypto.randomUUID();
    const c = demoCandidate(cid);
    const user: UserRecord = {
      id: cid,
      email: `${cid}@demo.invalid`,
      passwordHash: "disabled",
      is_demo: true,
    };
    this.users.set(cid, user);
    this.candidates.set(cid, c);
    const { token, expiresAt } = this.createSession(cid);
    return { candidate: c, token, expiresAt };
  }

  registerUser(
    emailRaw: string,
    passwordRaw: string,
  ): { candidate: Candidate; token: string; expiresAt: Date } {
    this.init();
    const email = emailRaw.trim().toLowerCase();
    for (const u of this.users.values()) {
      if (u.email === email && !u.is_demo) {
        throw new Error("Ce compte ne peut pas être créé. Essayez de vous connecter.");
      }
    }
    const cid = crypto.randomUUID();
    const c = emptyCandidate(cid, email);
    const user: UserRecord = {
      id: cid,
      email,
      passwordHash: this.hashPassword(passwordRaw),
      is_demo: false,
    };
    this.users.set(cid, user);
    this.candidates.set(cid, c);
    const { token, expiresAt } = this.createSession(cid);
    return { candidate: c, token, expiresAt };
  }

  loginUser(
    emailRaw: string,
    passwordRaw: string,
  ): { candidate: Candidate; token: string; expiresAt: Date } {
    this.init();
    const email = emailRaw.trim().toLowerCase();
    let foundUser: UserRecord | null = null;
    for (const u of this.users.values()) {
      if (u.email === email && !u.is_demo) {
        foundUser = u;
        break;
      }
    }
    if (!foundUser || !this.verifyPassword(passwordRaw, foundUser.passwordHash)) {
      throw new Error("Email ou mot de passe incorrect.");
    }
    const c = this.candidates.get(foundUser.id);
    if (!c) throw new Error("Dossier introuvable.");
    const { token, expiresAt } = this.createSession(foundUser.id);
    return { candidate: c, token, expiresAt };
  }
}

// Global singleton
const globalStoreKey = Symbol.for("campuspath.db");
const globalObj = globalThis as unknown as { [key: symbol]: DatabaseStore };
if (!globalObj[globalStoreKey]) {
  globalObj[globalStoreKey] = new DatabaseStore();
  globalObj[globalStoreKey].init();
}

export const db = globalObj[globalStoreKey];
