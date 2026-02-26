import fs from "fs";
import path from "path";
import crypto from "crypto";

/* ──── types ──── */

export interface StoredUser {
    terminalId: string;
    accessCode: string;
    fullName: string;
    email: string;
    phone: string;
    organization: string;
    createdAt: string;
}

/* ──── file path ──── */

function getDataDir(): string {
    const configured = process.env.DATA_DIR;
    if (configured && configured.trim()) {
        return configured.trim();
    }

    // On many hosts (e.g. serverless), the project directory is read-only.
    // /tmp is typically writable.
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        return path.join("/tmp", "gettradingbias");
    }

    return path.join(process.cwd(), "data");
}

const USERS_FILE = path.join(getDataDir(), "users.json");

/* ──── KV (Vercel KV / Upstash REST) ──── */

function kvConfigured(): boolean {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    return Boolean(url && token);
}

async function kvFetch<T>(command: string, args: string[]): Promise<T | null> {
    const baseUrl = process.env.UPSTASH_REDIS_REST_URL as string | undefined;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN as string | undefined;

    if (!baseUrl || !token) return null;

    const url = `${baseUrl}/${[command, ...args].map(encodeURIComponent).join("/")}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) return null;

    const json = (await res.json()) as { result?: unknown };
    return (json.result as T) ?? null;
}

async function kvGetJson<T>(key: string): Promise<T | null> {
    const raw = await kvFetch<string>("get", [key]);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

async function kvSetJson(key: string, value: unknown): Promise<boolean> {
    const ok = await kvFetch<string>("set", [key, JSON.stringify(value)]);
    return ok !== null;
}

function emailKey(email: string): string {
    return `user:email:${email.trim().toLowerCase()}`;
}

function terminalKey(terminalId: string): string {
    return `user:terminal:${terminalId.trim().toUpperCase()}`;
}

/* ──── helpers ──── */

function ensureDataDir(): void {
    const dataDir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

function readUsers(): StoredUser[] {
    try {
        ensureDataDir();
    } catch {
        return [];
    }

    if (!fs.existsSync(USERS_FILE)) {
        try {
            fs.writeFileSync(USERS_FILE, "[]", "utf-8");
        } catch {
            return [];
        }
        return [];
    }
    try {
        const raw = fs.readFileSync(USERS_FILE, "utf-8");
        return JSON.parse(raw) as StoredUser[];
    } catch {
        return [];
    }
}

function writeUsers(users: StoredUser[]): void {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

/* ──── public API ──── */

export function generateTerminalId(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = crypto.randomBytes(8);
    let id = "AD-";
    for (let i = 0; i < 8; i++) {
        id += chars[bytes[i] % chars.length];
    }
    return id;
}

export function generateAccessCode(): string {
    const bytes = crypto.randomBytes(12);
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let code = "";
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) code += "-";
        code += chars[bytes[i] % chars.length];
    }
    return code;
}

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

export function hashPassword(plain: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
        .pbkdf2Sync(plain, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
        .toString("hex");
    return `pbkdf2:${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
    // Legacy SHA-256 (no prefix) — still verify but will be rehashed on next write
    if (!stored.startsWith("pbkdf2:")) {
        const legacy = crypto.createHash("sha256").update(plain).digest("hex");
        return legacy === stored;
    }
    const [, salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const candidate = crypto
        .pbkdf2Sync(plain, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
        .toString("hex");
    return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(hash, "hex"));
}

export async function createUser(params: {
    fullName: string;
    email: string;
    phone: string;
    organization: string;
}): Promise<{ user: StoredUser; plainAccessCode: string }> {
    const normalizedEmail = params.email.trim().toLowerCase();

    if (kvConfigured()) {
        const existingTerminalId = await kvFetch<string>("get", [emailKey(normalizedEmail)]);
        if (existingTerminalId) {
            throw new Error("EMAIL_EXISTS");
        }

        let terminalId = generateTerminalId();
        while (await kvGetJson<StoredUser>(terminalKey(terminalId))) {
            terminalId = generateTerminalId();
        }

        const plainAccessCode = generateAccessCode();
        const hashedCode = hashPassword(plainAccessCode);

        const user: StoredUser = {
            terminalId,
            accessCode: hashedCode,
            fullName: params.fullName.trim(),
            email: normalizedEmail,
            phone: params.phone.trim(),
            organization: params.organization.trim(),
            createdAt: new Date().toISOString(),
        };

        const ok1 = await kvSetJson(terminalKey(user.terminalId), user);
        const ok2 = await kvFetch<string>("set", [emailKey(user.email), user.terminalId]);

        if (!ok1 || ok2 === null) {
            throw new Error("STORE_FAILED");
        }

        return { user, plainAccessCode };
    }

    const users = readUsers();

    // Check for duplicate email
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
        throw new Error("EMAIL_EXISTS");
    }

    // Generate unique terminal ID
    let terminalId = generateTerminalId();
    while (users.some((u) => u.terminalId === terminalId)) {
        terminalId = generateTerminalId();
    }

    const plainAccessCode = generateAccessCode();
    const hashedCode = hashPassword(plainAccessCode);

    const user: StoredUser = {
        terminalId,
        accessCode: hashedCode,
        fullName: params.fullName.trim(),
        email: normalizedEmail,
        phone: params.phone.trim(),
        organization: params.organization.trim(),
        createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsers(users);

    return { user, plainAccessCode };
}

export async function authenticateUser(
    terminalId: string,
    accessCode: string,
): Promise<StoredUser | null> {
    if (kvConfigured()) {
        const user = await kvGetJson<StoredUser>(terminalKey(terminalId));
        if (!user) return null;
        return verifyPassword(accessCode, user.accessCode) ? user : null;
    }

    const users = readUsers();

    const user = users.find(
        (u) => u.terminalId.toUpperCase() === terminalId.trim().toUpperCase(),
    );
    if (!user) return null;

    return verifyPassword(accessCode, user.accessCode) ? user : null;
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
    const normalized = email.trim().toLowerCase();

    if (kvConfigured()) {
        const terminalId = await kvFetch<string>("get", [emailKey(normalized)]);
        if (!terminalId) return null;
        return await kvGetJson<StoredUser>(terminalKey(terminalId));
    }

    const users = readUsers();
    return users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

export async function getAllUsers(): Promise<StoredUser[]> {
    if (kvConfigured()) {
        return [];
    }
    return readUsers();
}
