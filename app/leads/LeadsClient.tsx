"use client";

import { useActionState, useEffect, useRef, useState } from "react";

export type Lead = {
  id: string;
  title: string;
  status: string;
  source: string | null;
  stage: string | null;
  budget: number | null;
  currency: string | null;
  region: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  notes: string | null;
};

type Filters = {
  search?: string;
  status?: string;
  source?: string;
};

type ActionState = {
  ok: boolean;
  message?: string;
  error?: string;
};

export default function LeadsClient({
  leads,
  filters,
  action,
}: {
  leads: Lead[];
  filters: Filters;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(action, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setDirty(false);
      setOpen(false);
    }
  }, [state.ok]);

  const handleToggle = () => {
    if (!open) return setOpen(true);
    if (dirty) return setConfirmClose(true);
    setOpen(false);
  };

  const confirmCloseYes = () => {
    setConfirmClose(false);
    setDirty(false);
    setOpen(false);
  };
  const confirmCloseNo = () => setConfirmClose(false);

  return (
    <div className="space-y-6">
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form className="flex flex-wrap gap-3 items-center" method="get">
          <input
            type="text"
            name="search"
            defaultValue={filters.search}
            placeholder="Search by title, contact, region"
            className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white w-64"
          />
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
          >
            <option value="">All status</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="LOST">Lost</option>
            <option value="WON">Won</option>
          </select>
          <select
            name="source"
            defaultValue={filters.source ?? ""}
            className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
          >
            <option value="">All sources</option>
            <option value="PORTAL">Portal</option>
            <option value="REFERRAL">Referral</option>
            <option value="CALL">Call</option>
            <option value="EMAIL">Email</option>
            <option value="WALKIN">Walk-in</option>
            <option value="CAMPAIGN">Campaign</option>
          </select>
          <button type="submit" className="btn-ghost text-sm">Filter</button>
        </form>

        <button onClick={handleToggle} className="btn-primary text-sm">Add lead</button>
      </div>

      {state.ok && (
        <div className="card border-green-500/30 bg-green-500/10 text-green-100 p-4 text-sm">
          {state.message ?? "Lead saved."}
        </div>
      )}
      {state.error && (
        <div className="card border-red-500/30 bg-red-500/10 text-red-100 p-4 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {leads.length === 0 && (
          <div className="card p-4 text-sm text-slate-300">No leads yet. Add your first one.</div>
        )}
        {leads.map((lead) => (
          <div key={lead.id} className="card p-5 flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-white">{lead.title}</div>
              <span className="pill">{lead.status}</span>
            </div>
            <div className="text-sm text-slate-300">
              {lead.region || "Region not set"} · {lead.source || "Unknown source"}
            </div>
            <div className="text-sm text-slate-200">
              {lead.budget ? `${lead.budget} ${lead.currency ?? "EGP"}` : "Budget TBD"}
            </div>
            <div className="text-xs text-slate-400">
              {lead.contactName || "No contact"} · {lead.contactPhone || "No phone"}
            </div>
            {lead.notes && <p className="text-sm text-slate-300 mt-1">{lead.notes}</p>}
          </div>
        ))}
      </div>

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-slate-950 border-l border-white/10 shadow-xl transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/10">
          <div className="text-white font-semibold">Add lead</div>
          <button onClick={handleToggle} className="text-slate-300 hover:text-white text-sm">Close</button>
        </div>
        <div className="p-5 overflow-y-auto h-[calc(100%-56px)]">
          <form
            ref={formRef}
            action={formAction}
            className="space-y-3"
            onChange={() => setDirty(true)}
          >
            <input type="hidden" name="__action" value="create" />
            <div className="space-y-1">
              <label className="text-sm text-slate-200" htmlFor="title">Title *</label>
              <input id="title" name="title" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="status">Status</label>
                <select id="status" name="status" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white">
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="LOST">Lost</option>
                  <option value="WON">Won</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="source">Source</label>
                <select id="source" name="source" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white">
                  <option value="PORTAL">Portal</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="CALL">Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="WALKIN">Walk-in</option>
                  <option value="CAMPAIGN">Campaign</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="stage">Stage</label>
                <input id="stage" name="stage" defaultValue="Prospect" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="region">Region</label>
                <input id="region" name="region" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="budget">Budget</label>
                <input id="budget" name="budget" type="number" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="currency">Currency</label>
                <input id="currency" name="currency" defaultValue="EGP" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200" htmlFor="contactName">Contact name</label>
              <input id="contactName" name="contactName" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="contactPhone">Contact phone</label>
                <input id="contactPhone" name="contactPhone" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="contactEmail">Contact email</label>
                <input id="contactEmail" name="contactEmail" type="email" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200" htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" rows={3} className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={handleToggle} className="btn-ghost text-sm">Cancel</button>
              <button type="submit" className="btn-primary text-sm">Save lead</button>
            </div>
          </form>
        </div>
      </div>

      {confirmClose && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-6">
          <div className="card p-6 max-w-md w-full space-y-3">
            <div className="text-lg font-semibold text-white">Discard changes?</div>
            <p className="muted text-sm">You have unsaved data. Are you sure you want to close the drawer?</p>
            <div className="flex justify-end gap-2">
              <button onClick={confirmCloseNo} className="btn-ghost text-sm">No</button>
              <button onClick={confirmCloseYes} className="btn-primary text-sm">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
