import "dotenv/config";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import express from "express";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { closeDatabase, initializeDatabase, query, withTransaction } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const localAccountEmail = "cernkey@outlook.com";
const statuses = new Set(["Lead", "Active", "Inactive"]);
const fields = ["name", "company", "email", "phone", "status", "notes"];
const passwordLength = 64;
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;
const sessionSecret = randomBytes(32);
const dummyPasswordSalt = randomBytes(16).toString("hex");
const activeSessions = new Map();
const scrypt = promisify(scryptCallback);
const loginAttempts = new Map();

app.disable("x-powered-by");
app.use(express.json({ limit: "4mb" }));

function getSession(request) {
  const cookie = request.headers.cookie?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith("crm_session="));
  if (!cookie) return null;

  const token = cookie.slice("crm_session=".length);
  const separator = token.lastIndexOf(".");
  if (separator < 0) return null;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  const suppliedBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes, expectedBytes)) return null;

  const [userIdText, expiresAtText, nonce] = payload.split(":");
  const userId = Number(userIdText);
  const expiresAt = Number(expiresAtText);
  if (userId !== 1 || !nonce || !Number.isSafeInteger(expiresAt)) return null;
  if (expiresAt < Date.now()) {
    activeSessions.delete(nonce);
    return null;
  }
  if (activeSessions.get(nonce) !== expiresAt) return null;
  return { userId, nonce };
}

function setSession(response) {
  const now = Date.now();
  for (const [nonce, expiry] of activeSessions) {
    if (expiry < now) activeSessions.delete(nonce);
  }
  const expiresAt = now + sessionLifetimeSeconds * 1000;
  const nonce = randomBytes(24).toString("base64url");
  activeSessions.set(nonce, expiresAt);
  const payload = `1:${expiresAt}:${nonce}`;
  const signature = createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  response.setHeader(
    "Set-Cookie",
    `crm_session=${payload}.${signature}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionLifetimeSeconds}`,
  );
}

function clearSession(request, response) {
  const session = getSession(request);
  if (session) activeSessions.delete(session.nonce);
  response.setHeader("Set-Cookie", "crm_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0");
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const derivedKey = await scrypt(password, salt, passwordLength);
  return { salt, hash: derivedKey.toString("hex") };
}

async function requireAuthentication(request, response, next) {
  request.session = getSession(request);
  if (!request.session) return response.status(401).json({ error: "Sign in to access your contacts." });
  next();
}

app.get("/api/health", async (_request, response, next) => {
  try {
    await query("SELECT 1");
    response.json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/status", async (request, response, next) => {
  try {
    const { rows } = await query("SELECT id, email FROM app_users WHERE id = 1");
    const user = rows[0];
    const authenticated = Boolean(user && getSession(request));
    response.json({
      configured: Boolean(user),
      authenticated,
      email: authenticated ? user.email : null,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/setup", async (request, response, next) => {
  const email = normalizeEmail(request.body?.email);
  const password = request.body?.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ error: "Enter a valid email address." });
  }
  if (email !== localAccountEmail) {
    return response.status(400).json({ error: `The local account email is ${localAccountEmail}.` });
  }
  if (typeof password !== "string" || password.length < 12 || Buffer.byteLength(password) > 1024) {
    return response.status(400).json({ error: "Use a password with at least 12 characters." });
  }

  try {
    const { salt, hash } = await hashPassword(password);
    const { rows } = await query(
      "INSERT INTO app_users (id, email, password_salt, password_hash) VALUES (1, $1, $2, $3) ON CONFLICT (id) DO NOTHING RETURNING email",
      [email, salt, hash],
    );
    if (!rows.length) return response.status(409).json({ error: "An account has already been set up. Sign in instead." });
    setSession(response);
    response.status(201).json({ email: rows[0].email });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  const address = request.socket.remoteAddress || "local";
  const attempt = loginAttempts.get(address);
  if (attempt?.lockedUntil > Date.now()) {
    return response.status(429).json({ error: "Too many sign-in attempts. Try again in 15 minutes." });
  }

  const email = normalizeEmail(request.body?.email);
  const password = request.body?.password;
  try {
    const { rows } = await query(
      "SELECT email, password_salt, password_hash FROM app_users WHERE id = 1 AND lower(email) = $1",
      [email],
    );
    const user = rows[0];
    const usablePassword = typeof password === "string" && Buffer.byteLength(password) <= 1024 ? password : "";
    const hash = await scrypt(usablePassword, user?.password_salt || dummyPasswordSalt, passwordLength);
    const savedHash = user ? Buffer.from(user.password_hash, "hex") : Buffer.alloc(passwordLength);
    const valid = Boolean(user && typeof password === "string" && savedHash.length === hash.length && timingSafeEqual(hash, savedHash));
    if (!valid) {
      const failures = (attempt?.failures || 0) + 1;
      loginAttempts.set(address, {
        failures: failures >= 5 ? 0 : failures,
        lockedUntil: failures >= 5 ? Date.now() + 15 * 60 * 1000 : 0,
      });
      return response.status(401).json({ error: "Email or password is incorrect." });
    }

    loginAttempts.delete(address);
    setSession(response);
    response.json({ email: user.email });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", (request, response) => {
  clearSession(request, response);
  response.status(204).end();
});

app.use("/api", requireAuthentication);

app.get("/api/contacts", async (_request, response, next) => {
  try {
    const { rows } = await query(
      "SELECT id, name, company, email, phone, status, notes, created_at, updated_at FROM contacts ORDER BY updated_at DESC, id DESC",
    );
    response.json(rows);
  } catch (error) {
    next(error);
  }
});

function validateContact(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Provide contact details as a JSON object." };
  }

  const contact = {};
  for (const field of fields) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      return { error: `${field} must be text.` };
    }
    contact[field] = (body[field] ?? "").trim();
  }
  if (!contact.name) return { error: "Name is required." };
  const limits = { name: 200, company: 200, email: 254, phone: 80, status: 20, notes: 4000 };
  for (const [field, limit] of Object.entries(limits)) {
    if (contact[field].length > limit) return { error: `${field} must be ${limit} characters or fewer.` };
  }
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    return { error: "Enter a valid email address." };
  }
  if (!statuses.has(contact.status || "Lead")) {
    return { error: "Choose Lead, Active, or Inactive as the status." };
  }
  contact.status ||= "Lead";
  return { contact };
}

app.post("/api/contacts/import", async (request, response, next) => {
  const contacts = request.body?.contacts;
  if (!Array.isArray(contacts) || !contacts.length) {
    return response.status(400).json({ error: "Choose a file with at least one named contact." });
  }
  if (contacts.length > 1000) {
    return response.status(400).json({ error: "Import up to 1,000 contacts at a time." });
  }

  const validated = contacts.map(validateContact);
  const invalidIndex = validated.findIndex((result) => result.error);
  if (invalidIndex !== -1) {
    return response.status(400).json({
      error: `Contact ${invalidIndex + 1}: ${validated[invalidIndex].error}`,
    });
  }

  try {
    const uniqueEmails = [...new Set(validated.map(({ contact }) => contact.email.toLowerCase()).filter(Boolean))];
    const existing = uniqueEmails.length
      ? await query("SELECT lower(email) AS email FROM contacts WHERE lower(email) = ANY($1::text[])", [uniqueEmails])
      : { rows: [] };
    const seenEmails = new Set(existing.rows.map((row) => row.email));
    const toImport = [];
    let skippedDuplicates = 0;

    for (const { contact } of validated) {
      const email = contact.email.toLowerCase();
      if (email && seenEmails.has(email)) {
        skippedDuplicates += 1;
        continue;
      }
      if (email) seenEmails.add(email);
      toImport.push(contact);
    }

    const imported = await withTransaction(async (client) => {
      const rows = [];
      for (const contact of toImport) {
        const result = await client.query(
          "INSERT INTO contacts (name, company, email, phone, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, company, email, phone, status, notes, created_at, updated_at",
          fields.map((field) => contact[field]),
        );
        rows.push(result.rows[0]);
      }
      return rows;
    });
    response.status(201).json({ imported, skippedDuplicates });
  } catch (error) {
    next(error);
  }
});

app.post("/api/contacts", async (request, response, next) => {
  const { contact, error } = validateContact(request.body);
  if (error) return response.status(400).json({ error });

  try {
    const { rows } = await query(
      "INSERT INTO contacts (name, company, email, phone, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      fields.map((field) => contact[field]),
    );
    response.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put("/api/contacts/:id", async (request, response, next) => {
  if (!/^\d+$/.test(request.params.id)) {
    return response.status(400).json({ error: "Contact ID must be a positive integer." });
  }
  const { contact, error } = validateContact(request.body);
  if (error) return response.status(400).json({ error });

  try {
    const { rows } = await query(
      `UPDATE contacts SET name = $1, company = $2, email = $3, phone = $4, status = $5, notes = $6, updated_at = now()
       WHERE id = $7 RETURNING *`,
      [...fields.map((field) => contact[field]), request.params.id],
    );
    if (!rows.length) return response.status(404).json({ error: "Contact not found." });
    response.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/contacts/:id", async (request, response, next) => {
  if (!/^\d+$/.test(request.params.id)) {
    return response.status(400).json({ error: "Contact ID must be a positive integer." });
  }

  try {
    const { rowCount } = await query("DELETE FROM contacts WHERE id = $1", [request.params.id]);
    if (!rowCount) return response.status(404).json({ error: "Contact not found." });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

if (process.env.NODE_ENV === "production") {
  const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
  app.use(express.static(clientDir));
  app.get("*path", (_request, response) => response.sendFile(path.join(clientDir, "index.html")));
}

app.use((error, _request, response, _next) => {
  console.error("Request failed:", error);
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "Request body must contain valid JSON." });
  }
  if (error.status === 413) return response.status(413).json({ error: "The request is too large." });
  response.status(500).json({ error: "The server could not complete the request." });
});

await initializeDatabase();
const server = app.listen(port, "127.0.0.1", () => {
  console.log(`CRM API listening on http://127.0.0.1:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  });
}
