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

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

/* ──── helpers ──── */

function ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function readUsers(): StoredUser[] {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, "[]", "utf-8");
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
    let id = "HT-";
    for (let i = 0; i < 8; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
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

export function hashPassword(plain: string): string {
    return crypto.createHash("sha256").update(plain).digest("hex");
}

export function createUser(params: {
    fullName: string;
    email: string;
    phone: string;
    organization: string;
}): { user: StoredUser; plainAccessCode: string } {
    const users = readUsers();

    // Check for duplicate email
    const existing = users.find(
        (u) => u.email.toLowerCase() === params.email.toLowerCase(),
    );
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
        email: params.email.trim().toLowerCase(),
        phone: params.phone.trim(),
        organization: params.organization.trim(),
        createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsers(users);

    return { user, plainAccessCode };
}

export function authenticateUser(
    terminalId: string,
    accessCode: string,
): StoredUser | null {
    const users = readUsers();
    const hashed = hashPassword(accessCode);

    const user = users.find(
        (u) =>
            u.terminalId.toUpperCase() === terminalId.trim().toUpperCase() &&
            u.accessCode === hashed,
    );

    return user ?? null;
}

export function findUserByEmail(email: string): StoredUser | null {
    const users = readUsers();
    return (
        users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
    );
}

export function getAllUsers(): StoredUser[] {
    return readUsers();
}
