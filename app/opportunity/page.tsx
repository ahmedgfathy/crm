import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import DashboardShell from "../../components/DashboardShell";
import OpportunityClient from "./OpportunityClient";
import { getSession } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

type ActionState = {
  ok: boolean;
  message?: string;
  error?: string;
};

async function createOpportunity(_prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const title = (formData.get("title") as string)?.trim();
  const stage = (formData.get("stage") as string) || "Qualified";
  const status = (formData.get("status") as string) || "OPEN";
  const value = formData.get("value") ? Number(formData.get("value")) : null;
  const currency = (formData.get("currency") as string)?.trim() || "EGP";
  const probability = formData.get("probability") ? Number(formData.get("probability")) : null;
  const closeDateRaw = formData.get("closeDate") as string;
  const owner = (formData.get("owner") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!title) return { ok: false, error: "Title is required." };
  if (probability != null && (probability < 0 || probability > 100)) {
    return { ok: false, error: "Probability must be between 0 and 100." };
  }

  const company =
    (await prisma.company.findFirst()) ||
    (await prisma.company.create({ data: { name: "Default Company" } }));

  await prisma.opportunity.create({
    data: {
      title,
      stage,
      status,
      value,
      currency,
      probability,
      closeDate: closeDateRaw ? new Date(closeDateRaw) : null,
      owner,
      notes,
      companyId: company.id,
    },
  });

  revalidatePath("/opportunity");
  return { ok: true, message: "Opportunity saved" };
}

export default async function OpportunityPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; stage?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const search = params?.search?.trim() || undefined;
  const filterStage = params?.stage || undefined;
  const filterStatus = params?.status || undefined;

  const opportunities = await prisma.opportunity.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    where: {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { owner: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
              ],
            }
          : undefined,
        filterStage ? { stage: filterStage } : undefined,
        filterStatus ? { status: filterStatus } : undefined,
      ].filter(Boolean) as any,
    },
  });

  const clientOps = opportunities.map((opp) => ({
    ...opp,
    closeDate: opp.closeDate ? opp.closeDate.toISOString().slice(0, 10) : null,
  }));

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="pill">Opportunity</p>
          <h1 className="text-3xl font-bold text-white">Opportunities</h1>
          <p className="muted text-sm">Single-company pipeline: stage, value, probability, owners, and close dates.</p>
        </div>

        <OpportunityClient
          opportunities={clientOps}
          filters={{ search, stage: filterStage, status: filterStatus }}
          action={createOpportunity}
        />
      </div>
    </DashboardShell>
  );
}
