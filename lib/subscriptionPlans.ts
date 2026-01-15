import { prisma } from "./prisma";

export type SubscriptionPlanInput = {
  name: string;
  category?: string | null;
  description?: string | null;
  priceAmount?: number | null;
  currency?: string;
  billingCycle?: string;
  usersLimit?: number | null;
  storageGB?: number | null;
  bandwidthGB?: number | null;
  propertiesLimit?: number | null;
  leadsLimit?: number | null;
  estatesLimit?: number | null;
};

export async function listSubscriptionPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { createdAt: "desc" } });
}

export async function listActiveSubscriptionPlans() {
  return prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
}

export async function updateSubscriptionPlan(id: string, data: SubscriptionPlanInput) {
  return prisma.subscriptionPlan.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category || null,
      description: data.description || null,
      priceAmount: data.priceAmount ?? null,
      currency: data.currency || "EGP",
      billingCycle: data.billingCycle || "monthly",
      usersLimit: data.usersLimit ?? null,
      storageGB: data.storageGB ?? null,
      bandwidthGB: data.bandwidthGB ?? null,
      propertiesLimit: data.propertiesLimit ?? null,
      leadsLimit: data.leadsLimit ?? null,
      estatesLimit: data.estatesLimit ?? null,
    },
  });
}

export async function createSubscriptionPlan(data: SubscriptionPlanInput) {
  return prisma.subscriptionPlan.create({
    data: {
      name: data.name,
      category: data.category || null,
      description: data.description || null,
      priceAmount: data.priceAmount ?? null,
      currency: data.currency || "EGP",
      billingCycle: data.billingCycle || "monthly",
      usersLimit: data.usersLimit ?? null,
      storageGB: data.storageGB ?? null,
      bandwidthGB: data.bandwidthGB ?? null,
      propertiesLimit: data.propertiesLimit ?? null,
      leadsLimit: data.leadsLimit ?? null,
      estatesLimit: data.estatesLimit ?? null,
    },
  });
}

export async function setSubscriptionPlanActive(id: string, isActive: boolean) {
  return prisma.subscriptionPlan.update({
    where: { id },
    data: { isActive },
  });
}
