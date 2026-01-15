import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import LeadsClient from "./LeadsClient";

type ActionState = {
  ok: boolean;
  message?: string;
  error?: string;
};

async function createLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const title = (formData.get("title") as string)?.trim();
  const status = (formData.get("status") as string) || "NEW";
  const source = (formData.get("source") as string) || null;
  const stage = (formData.get("stage") as string)?.trim() || "Prospect";
  const budget = formData.get("budget") ? Number(formData.get("budget")) : null;
  const currency = (formData.get("currency") as string)?.trim() || "EGP";
  const region = (formData.get("region") as string)?.trim() || null;
  const contactName = (formData.get("contactName") as string)?.trim() || null;
  const contactPhone = (formData.get("contactPhone") as string)?.trim() || null;
  const contactEmail = (formData.get("contactEmail") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!title) return { ok: false, error: "Title is required." };

  const company =
    (await prisma.company.findFirst()) ||
    (await prisma.company.create({ data: { name: "Default Company" } }));

  await prisma.lead.create({
    data: {
      title,
      status,
      source,
      stage,
      budget,
      currency,
      region,
      contactName,
      contactPhone,
      contactEmail,
      notes,
      companyId: company.id,
    },
  });

  revalidatePath("/leads");
  return { ok: true, message: "Lead saved" };
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; source?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const search = params?.search?.trim() || undefined;
  const filterStatus = params?.status || undefined;
  const filterSource = params?.source || undefined;

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    where: {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { contactName: { contains: search, mode: "insensitive" } },
                { region: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
              ],
            }
          : undefined,
        filterStatus ? { status: filterStatus } : undefined,
        filterSource ? { source: filterSource } : undefined,
      ].filter(Boolean) as any,
    },
  });

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-center gap-2">
        <p className="pill text-xs">Leads</p>
        <p className="muted text-sm">Source, status, budget, region, contacts at a glance.</p>
      </div>

      <LeadsClient
        leads={leads}
        filters={{ search, status: filterStatus, source: filterSource }}
        action={createLead}
      />
    </DashboardShell>
  );
}
