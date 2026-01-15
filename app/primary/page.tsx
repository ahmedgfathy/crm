import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import PrimaryClient, { Developer, PrimaryProject, PrimaryUnit } from "./PrimaryClient";

type ActionState = {
  ok: boolean;
  message?: string;
  error?: string;
};

async function createDeveloper(_prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  const contact = (formData.get("contact") as string)?.trim() || null;
  const brief = (formData.get("brief") as string)?.trim() || null;
  const history = (formData.get("history") as string)?.trim() || null;

  if (!name) return { ok: false, error: "Developer name is required." };

  await prisma.developer.create({ data: { name, contact, brief, history } });

  revalidatePath("/primary");
  return { ok: true, message: "Developer saved" };
}

async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  const developerId = (formData.get("developerId") as string)?.trim();
  const region = (formData.get("region") as string)?.trim() || null;
  const status = (formData.get("status") as string)?.trim() || "Planned";
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { ok: false, error: "Project name is required." };
  if (!developerId) return { ok: false, error: "Developer is required." };

  await prisma.primaryProject.create({
    data: {
      name,
      region,
      status,
      description,
      developerId,
    },
  });

  revalidatePath("/primary");
  return { ok: true, message: "Project saved" };
}

async function createUnit(_prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const projectId = (formData.get("projectId") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const type = (formData.get("type") as string)?.trim() || "Unit";
  const status = (formData.get("status") as string)?.trim() || "AVAILABLE";
  const price = formData.get("price") ? Number(formData.get("price")) : null;
  const currency = (formData.get("currency") as string)?.trim() || "EGP";
  const bedrooms = formData.get("bedrooms") ? Number(formData.get("bedrooms")) : null;
  const bathrooms = formData.get("bathrooms") ? Number(formData.get("bathrooms")) : null;
  const area = formData.get("area") ? Number(formData.get("area")) : null;
  const areaUnit = (formData.get("areaUnit") as string)?.trim() || "sqm";
  const region = (formData.get("region") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!projectId) return { ok: false, error: "Select a project." };
  if (!title) return { ok: false, error: "Unit title is required." };

  const project = await prisma.primaryProject.findUnique({ where: { id: projectId } });
  if (!project) return { ok: false, error: "Project not found." };

  await prisma.primaryUnit.create({
    data: {
      title,
      type,
      status,
      price,
      currency,
      bedrooms,
      bathrooms,
      area,
      areaUnit,
      region,
      notes,
      projectId,
    },
  });

  revalidatePath("/primary");
  return { ok: true, message: "Unit saved" };
}

export default async function PrimaryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const devs = await prisma.developer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          units: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  const developers: Developer[] = devs.map((dev) => ({
    id: dev.id,
    name: dev.name,
    contact: dev.contact,
    brief: dev.brief,
    history: dev.history,
    projects: dev.projects.map<PrimaryProject>((p) => ({
      id: p.id,
      name: p.name,
      region: p.region,
      status: p.status,
      description: p.description,
      createdAt: p.createdAt.toISOString(),
      units: p.units.map<PrimaryUnit>((u) => ({
        id: u.id,
        title: u.title,
        type: u.type,
        status: u.status,
        price: u.price,
        currency: u.currency,
        bedrooms: u.bedrooms,
        bathrooms: u.bathrooms,
        area: u.area,
        areaUnit: u.areaUnit,
        region: u.region,
        notes: u.notes,
        projectId: u.projectId,
      })),
    })),
  }));

  return (
    <DashboardShell>
      <PrimaryClient
        developers={developers}
        developerAction={createDeveloper}
        projectAction={createProject}
        unitAction={createUnit}
      />
    </DashboardShell>
  );
}
