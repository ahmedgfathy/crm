import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import PropertiesClient from "./PropertiesClient";

type ActionState = {
  ok: boolean;
  message?: string;
  error?: string;
};

async function createProperty(_prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const title = (formData.get("title") as string)?.trim();
  const type = formData.get("type") as string;
  const status = formData.get("status") as string;
  const price = Number(formData.get("price")) || null;
  const currency = (formData.get("currency") as string)?.trim() || "EGP";
  const region = (formData.get("region") as string)?.trim() || null;
  const bedrooms = formData.get("bedrooms") ? Number(formData.get("bedrooms")) : null;
  const bathrooms = formData.get("bathrooms") ? Number(formData.get("bathrooms")) : null;
  const area = formData.get("area") ? Number(formData.get("area")) : null;
  const areaUnit = (formData.get("areaUnit") as string)?.trim() || "sqm";
  const description = (formData.get("description") as string)?.trim() || null;

  if (!title || !type) {
    return { ok: false, error: "Title and type are required." };
  }

  // Temporary: assign to a default company if exists, else create one.
  const company =
    (await prisma.company.findFirst()) ||
    (await prisma.company.create({ data: { name: "Default Company" } }));

  await prisma.property.create({
    data: {
      title,
      type: type as any,
      status: (status as any) || "AVAILABLE",
      price,
      currency,
      city: region,
      country: null,
      addressLine: null,
      bedrooms,
      bathrooms,
      area,
      areaUnit,
      description,
      companyId: company.id,
    },
  });

  revalidatePath("/properties");
  return { ok: true, message: "Property saved" };
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; search?: string; type?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const error = params?.error === "missing" ? "Title and type are required." : null;
  const search = params?.search?.trim() || undefined;
  const filterType = params?.type || undefined;
  const filterStatus = params?.status || undefined;

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    where: {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
              ],
            }
          : undefined,
        filterType ? { type: filterType } : undefined,
        filterStatus ? { status: filterStatus } : undefined,
      ].filter(Boolean) as any,
    },
  });

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="pill">Properties</p>
          <h1 className="text-3xl font-bold text-white">Properties</h1>
          <p className="muted text-sm">Single-company inventory: type, status, pricing, and regions in one view.</p>
        </div>

        <PropertiesClient
          properties={properties}
          filters={{ search, type: filterType, status: filterStatus }}
          action={createProperty}
        />
      </div>
    </DashboardShell>
  );
}
