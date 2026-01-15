import { prisma } from "./prisma";

export type SignupStatus = "PENDING" | "APPROVED" | "REJECTED";

export async function createSignupRequest(params: {
  mobile: string;
  email?: string | null;
  company: string;
  password?: string | null;
  subscriptionPlanId?: string | null;
}) {
  const existing = await prisma.signupRequest.findFirst({
    where: { mobile: params.mobile, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return prisma.signupRequest.update({
      where: { id: existing.id },
      data: {
        email: params.email ?? existing.email,
        company: params.company,
        password: params.password ?? existing.password,
        subscriptionPlanId: params.subscriptionPlanId ?? existing.subscriptionPlanId,
      },
    });
  }

  return prisma.signupRequest.create({
    data: {
      mobile: params.mobile,
      email: params.email,
      company: params.company,
      password: params.password,
      subscriptionPlanId: params.subscriptionPlanId ?? null,
    },
  });
}

export async function listSignupRequests() {
  return prisma.signupRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { subscriptionPlan: true },
  });
}

export async function updateSignupPlan(id: string, subscriptionPlanId: string | null) {
  try {
    return await prisma.signupRequest.update({ where: { id }, data: { subscriptionPlanId } });
  } catch (err) {
    return null;
  }
}

export async function updateSignupStatus(id: string, status: SignupStatus, note?: string | null) {
  try {
    return await prisma.signupRequest.update({
      where: { id },
      data: { status, note },
    });
  } catch (err) {
    return null;
  }
}

export async function getSignupRequest(id: string) {
  return prisma.signupRequest.findUnique({ where: { id } });
}

export async function updateSignupContact(id: string, params: { mobile: string; email?: string | null }) {
  try {
    return await prisma.signupRequest.update({
      where: { id },
      data: { mobile: params.mobile, email: params.email },
    });
  } catch (err) {
    return null;
  }
}

export async function updateSignupPassword(id: string, password: string) {
  try {
    return await prisma.signupRequest.update({ where: { id }, data: { password } });
  } catch (err) {
    return null;
  }
}
