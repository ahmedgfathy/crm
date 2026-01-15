import { randomUUID } from "crypto";

export type SignupStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SignupRequest = {
  id: string;
  mobile: string;
  email?: string | null;
  company: string;
  password?: string | null;
  status: SignupStatus;
  createdAt: Date;
  updatedAt: Date;
  note?: string | null;
};

const requests: SignupRequest[] = [];

export async function createSignupRequest(params: {
  mobile: string;
  email?: string | null;
  company: string;
  password?: string | null;
}): Promise<SignupRequest> {
  const now = new Date();
  const existing = requests.find((r) => r.mobile === params.mobile && r.status === "PENDING");
  if (existing) {
    existing.email = params.email ?? existing.email;
    existing.company = params.company;
    existing.password = params.password ?? existing.password;
    existing.updatedAt = now;
    return existing;
  }

  const created: SignupRequest = {
    id: randomUUID(),
    mobile: params.mobile,
    email: params.email ?? null,
    company: params.company,
    password: params.password ?? null,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
    note: null,
  };
  requests.unshift(created);
  return created;
}

export async function listSignupRequests(): Promise<SignupRequest[]> {
  return [...requests];
}

export async function updateSignupStatus(id: string, status: SignupStatus, note?: string | null) {
  const found = requests.find((r) => r.id === id);
  if (!found) return null;
  found.status = status;
  found.updatedAt = new Date();
  if (note !== undefined) found.note = note;
  return found;
}

export async function getSignupRequest(id: string): Promise<SignupRequest | null> {
  return requests.find((r) => r.id === id) ?? null;
}
