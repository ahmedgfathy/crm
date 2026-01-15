import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../../../lib/prisma";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const share = await prisma.shareLink.findUnique({
    where: { token },
    select: {
      expiresAt: true,
      createdAt: true,
      document: {
        select: {
          name: true,
          mimeType: true,
          size: true,
        },
      },
    },
  });

  if (!share || !share.document) return notFound();

  if (share.expiresAt && share.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-3 text-center">
          <p className="text-lg font-semibold">Link expired</p>
          <p className="text-slate-400 text-sm">This share link is no longer active.</p>
        </div>
      </div>
    );
  }

  const downloadUrl = `/document/share/${token}/download`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full card p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="pill">Shared file</span>
          <span>Available via secure link</span>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-semibold">{share.document.name}</p>
          <p className="text-sm text-slate-400">{share.document.mimeType || "file"}</p>
          {share.document.size != null && (
            <p className="text-xs text-slate-500">Size: {(share.document.size / (1024 * 1024)).toFixed(2)} MB</p>
          )}
          {share.expiresAt && (
            <p className="text-xs text-slate-500">Expires: {share.expiresAt.toLocaleString()}</p>
          )}
        </div>
        <a href={downloadUrl} className="btn-primary w-full text-center">Download</a>
        <Link href="/document" className="btn-ghost text-center w-full text-sm">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
