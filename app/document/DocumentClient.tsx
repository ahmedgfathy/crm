"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";

export type DocItem = {
  id: string;
  name: string;
  mimeType: string | null;
  size: number | null;
  folderId: string | null;
  createdAt: string;
  latestShareToken?: string | null;
  latestShareExpiresAt?: string | null;
};

export type FolderItem = {
  id: string;
  name: string;
  createdAt: string;
  documents: DocItem[];
};

type Filters = {
  search?: string;
};

type ActionState = {
  ok: boolean;
  message?: string;
  error?: string;
};

function formatSize(bytes: number | null): string {
  if (bytes == null) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentClient({
  folders,
  looseDocuments,
  filters,
  uploadAction,
  folderAction,
  shareAction,
}: {
  folders: FolderItem[];
  looseDocuments: DocItem[];
  filters: Filters;
  uploadAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  folderAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  shareAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [uploadState, uploadFormAction] = useActionState<ActionState, FormData>(uploadAction, { ok: false });
  const [folderState, folderFormAction] = useActionState<ActionState, FormData>(folderAction, { ok: false });
  const [shareState, shareFormAction] = useActionState<ActionState, FormData>(shareAction, { ok: false });

  const uploadRef = useRef<HTMLFormElement>(null);
  const folderRef = useRef<HTMLFormElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const searchTerm = filters.search?.toLowerCase().trim();

  const totalFiles = folders.reduce((sum, f) => sum + f.documents.length, 0) + looseDocuments.length;
  const totalFolders = folders.length;

  const filteredFolders = useMemo(() => {
    if (!searchTerm) return folders;
    return folders
      .map((folder) => {
        const docs = folder.documents.filter((doc) =>
          `${doc.name} ${doc.mimeType || ""}`.toLowerCase().includes(searchTerm)
        );
        return docs.length > 0 || folder.name.toLowerCase().includes(searchTerm)
          ? { ...folder, documents: docs }
          : null;
      })
      .filter(Boolean) as typeof folders;
  }, [folders, searchTerm]);

  const filteredLooseDocs = useMemo(() => {
    if (!searchTerm) return looseDocuments;
    return looseDocuments.filter((doc) => `${doc.name} ${doc.mimeType || ""}`.toLowerCase().includes(searchTerm));
  }, [looseDocuments, searchTerm]);

  useEffect(() => {
    if (uploadState.ok) uploadRef.current?.reset();
    if (folderState.ok) folderRef.current?.reset();
  }, [uploadState.ok, folderState.ok]);

  const folderOptions = useMemo(
    () => folders.map((f) => ({ id: f.id, name: f.name })),
    [folders]
  );

  const renderDocCard = (doc: DocItem) => {
    const shareUrl = doc.latestShareToken
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/document/share/${doc.latestShareToken}`
      : null;

    const copyLink = () => {
      if (!shareUrl) return;
      navigator.clipboard.writeText(shareUrl).then(() => setCopiedId(doc.id));
      setTimeout(() => setCopiedId(null), 1500);
    };

    return (
      <div key={doc.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-4 shadow-sm hover:border-brand-300/60 transition">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white font-semibold leading-tight">{doc.name}</p>
            <p className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleString()}</p>
          </div>
          <span className="pill text-[11px]">{doc.mimeType || "file"}</span>
        </div>
        <div className="mt-2 text-sm text-slate-200 flex items-center gap-2">
          <span>{formatSize(doc.size)}</span>
        </div>
        {shareUrl ? (
          <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-white/5 p-2 text-xs">
            <div className="text-slate-300 break-all">{shareUrl}</div>
            <button onClick={copyLink} className="btn-ghost text-[11px]">
              {copiedId === doc.id ? "Copied" : "Copy link"}
            </button>
          </div>
        ) : (
          <form action={shareFormAction} className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <input type="hidden" name="documentId" value={doc.id} />
            <label htmlFor={`expires-${doc.id}`} className="text-slate-300">Expires (days)</label>
            <input
              id={`expires-${doc.id}`}
              name="expires"
              type="number"
              min="1"
              max="365"
              className="w-24 rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1 text-white"
            />
            <button type="submit" className="btn-primary text-[11px]">Create share link</button>
            {shareState.error && <span className="text-red-200">{shareState.error}</span>}
            {shareState.ok && <span className="text-green-200">Created</span>}
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {(uploadState.error || folderState.error || shareState.error) && (
        <div className="card border-red-500/30 bg-red-500/10 text-red-100 p-3 text-sm">
          {uploadState.error || folderState.error || shareState.error}
        </div>
      )}
      {(uploadState.ok || folderState.ok || shareState.ok) && (
        <div className="card border-green-500/30 bg-green-500/10 text-green-100 p-3 text-sm">
          {uploadState.message || folderState.message || shareState.message || "Saved."}
        </div>
      )}

      {searchTerm && (
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="pill">Filter</span>
          <span>Showing results for "{filters.search}"</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-300">Workspace pulse</p>
              <p className="text-xl font-semibold text-white">{totalFiles} files • {totalFolders} folders</p>
            </div>
            {searchTerm && (
              <span className="pill text-xs">Filter: {filters.search}</span>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              <p className="text-xs text-slate-400">Recent action</p>
              <p className="font-semibold text-white">Upload &amp; share in one place</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              <p className="text-xs text-slate-400">Security</p>
              <p className="font-semibold text-white">Expiring share links</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              <p className="text-xs text-slate-400">Navigation</p>
              <p className="font-semibold text-white">Folders + loose files</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/60 p-5 space-y-5 shadow-sm">
          <div className="space-y-2">
            <p className="text-white font-semibold">Upload file</p>
            <p className="text-xs text-slate-400">Files up to 8MB. They stay in your company workspace.</p>
          </div>
          <form ref={uploadRef} action={uploadFormAction} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm text-slate-200" htmlFor="file">File *</label>
              <input id="file" name="file" type="file" className="w-full text-sm text-white" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-200" htmlFor="folder">Folder</label>
              <select
                id="folder"
                name="folderId"
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
                defaultValue=""
              >
                <option value="">Root</option>
                {folderOptions.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary text-sm w-full">Upload</button>
          </form>

          <div className="h-px bg-white/10" />

          <div className="space-y-2">
            <p className="text-white font-semibold">Create folder</p>
            <p className="text-xs text-slate-400">Organize files into clear spaces.</p>
          </div>
          <form ref={folderRef} action={folderFormAction} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm text-slate-200" htmlFor="folderName">Folder name *</label>
              <input id="folderName" name="name" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" required />
            </div>
            <button type="submit" className="btn-ghost text-sm w-full">Create folder</button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        {filteredFolders.length === 0 && filteredLooseDocs.length === 0 && (
          <div className="card p-4 text-sm text-slate-300">No files yet. Upload your first file.</div>
        )}

        {filteredFolders.map((folder) => (
          <div key={folder.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="pill">Folder</span>
              <p className="text-white font-semibold">{folder.name}</p>
              <p className="text-xs text-slate-500">{new Date(folder.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {folder.documents.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/50 p-3 text-sm text-slate-400">Empty folder</div>
              )}
              {folder.documents.map((doc) => renderDocCard(doc))}
            </div>
          </div>
        ))}

        {filteredLooseDocs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="pill">Root</span>
              <p className="text-white font-semibold">Files</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredLooseDocs.map((doc) => renderDocCard(doc))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
