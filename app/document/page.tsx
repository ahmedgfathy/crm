import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import DashboardShell from "../../components/DashboardShell";
import DocumentClient, { DocItem, FolderItem } from "./DocumentClient";
import { getSession } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

type ActionState = {
  ok: boolean;
  message?: string;
  error?: string;
};

async function getOrCreateCompany() {
  return (
    (await prisma.company.findFirst()) ||
    (await prisma.company.create({ data: { name: "Default Company" } }))
  );
}

async function uploadFile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const file = formData.get("file") as File | null;
  const folderId = (formData.get("folderId") as string) || null;

  if (!file || file.size === 0) return { ok: false, error: "File is required." };
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: "File is larger than 8MB." };

  const company = await getOrCreateCompany();

  if (folderId) {
    const folder = await prisma.folder.findFirst({ where: { id: folderId, companyId: company.id } });
    if (!folder) return { ok: false, error: "Folder not found." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.documentFile.create({
    data: {
      name: file.name,
      mimeType: file.type || null,
      size: file.size || null,
      data: buffer,
      folderId,
      companyId: company.id,
    },
  });

  revalidatePath("/document");
  return { ok: true, message: "File uploaded." };
}

async function createFolder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { ok: false, error: "Folder name is required." };

  const company = await getOrCreateCompany();

  await prisma.folder.create({
    data: {
      name,
      companyId: company.id,
    },
  });

  revalidatePath("/document");
  return { ok: true, message: "Folder created." };
}

async function createShare(_prev: ActionState, formData: FormData): Promise<ActionState> {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const documentId = (formData.get("documentId") as string) || "";
  const expiresRaw = (formData.get("expires") as string) || "";

  if (!documentId) return { ok: false, error: "Document is required." };

  const company = await getOrCreateCompany();

  const document = await prisma.documentFile.findFirst({
    where: { id: documentId, companyId: company.id },
    select: { id: true },
  });

  if (!document) return { ok: false, error: "Document not found." };

  let expiresAt: Date | null = null;
  if (expiresRaw) {
    const days = Number(expiresRaw);
    if (!Number.isFinite(days) || days <= 0 || days > 365) {
      return { ok: false, error: "Expires must be between 1 and 365 days." };
    }
    const date = new Date();
    date.setDate(date.getDate() + days);
    expiresAt = date;
  }

  const token = randomUUID().replace(/-/g, "");

  await prisma.shareLink.create({
    data: {
      token,
      expiresAt,
      documentId: document.id,
      companyId: company.id,
    },
  });

  revalidatePath("/document");
  return { ok: true, message: "Share link created." };
}

export default async function DocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const search = params?.search?.trim() || undefined;

  const company = await getOrCreateCompany();

  const folders = await prisma.folder.findMany({
    where: {
      companyId: company.id,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { documents: { some: { name: { contains: search } } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      documents: {
        where: search ? { name: { contains: search } } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
          folderId: true,
          createdAt: true,
          shareLinks: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { token: true, expiresAt: true },
          },
        },
      },
    },
  });

  const looseDocuments = await prisma.documentFile.findMany({
    where: {
      companyId: company.id,
      folderId: null,
      ...(search ? { name: { contains: search } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      folderId: true,
      createdAt: true,
      shareLinks: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { token: true, expiresAt: true },
      },
    },
  });

  const folderItems: FolderItem[] = folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    createdAt: folder.createdAt.toISOString(),
    documents: folder.documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      mimeType: doc.mimeType,
      size: doc.size,
      folderId: doc.folderId,
      createdAt: doc.createdAt.toISOString(),
      latestShareToken: doc.shareLinks[0]?.token ?? null,
      latestShareExpiresAt: doc.shareLinks[0]?.expiresAt
        ? doc.shareLinks[0]?.expiresAt.toISOString()
        : null,
    })),
  }));

  const looseDocItems: DocItem[] = looseDocuments.map((doc) => ({
    id: doc.id,
    name: doc.name,
    mimeType: doc.mimeType,
    size: doc.size,
    folderId: doc.folderId,
    createdAt: doc.createdAt.toISOString(),
    latestShareToken: doc.shareLinks[0]?.token ?? null,
    latestShareExpiresAt: doc.shareLinks[0]?.expiresAt ? doc.shareLinks[0]?.expiresAt.toISOString() : null,
  }));

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-center gap-2">
        <p className="pill text-xs">Document</p>
        <p className="muted text-sm">Store files, organize folders, and share links securely.</p>
      </div>

      <form className="mt-4 flex flex-wrap gap-3" action="/document" method="get">
        <input
          name="search"
          defaultValue={search || ""}
          placeholder="Search files or folders"
          className="w-full max-w-md rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
        />
        <button type="submit" className="btn-ghost text-sm">Search</button>
      </form>

      <DocumentClient
        folders={folderItems}
        looseDocuments={looseDocItems}
        filters={{ search }}
        uploadAction={uploadFile}
        folderAction={createFolder}
        shareAction={createShare}
      />
    </DashboardShell>
  );
}
