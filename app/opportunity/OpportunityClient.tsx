"use client";

import { useActionState, useEffect, useRef, useState } from "react";

export type Opportunity = {
  id: string;
  title: string;
  stage: string;
  status: string;
  value: number | null;
  currency: string | null;
  probability: number | null;
  closeDate: string | null;
  owner: string | null;
  notes: string | null;
};

type Filters = {
  search?: string;
  stage?: string;
  status?: string;
};

type ActionState = {
  ok: boolean;
  message?: string;
  error?: string;
};

export default function OpportunityClient({
  opportunities,
  filters,
  action,
}: {
  opportunities: Opportunity[];
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
            placeholder="Search by title, owner"
            className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white w-64"
          />
          <select
            name="stage"
            defaultValue={filters.stage ?? ""}
            className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
          >
            <option value="">All stages</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Contract">Contract</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
          >
            <option value="">All status</option>
            <option value="OPEN">Open</option>
            <option value="ON HOLD">On hold</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
          <button type="submit" className="btn-ghost text-sm">Filter</button>
        </form>

        <button onClick={handleToggle} className="btn-primary text-sm">Add opportunity</button>
      </div>

      {state.ok && (
        <div className="card border-green-500/30 bg-green-500/10 text-green-100 p-4 text-sm">
          {state.message ?? "Opportunity saved."}
        </div>
      )}
      {state.error && (
        <div className="card border-red-500/30 bg-red-500/10 text-red-100 p-4 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {opportunities.length === 0 && (
          <div className="card p-4 text-sm text-slate-300">No opportunities yet. Add your first one.</div>
        )}
        {opportunities.map((opp) => (
          <div key={opp.id} className="card p-5 flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-white">{opp.title}</div>
              <span className="pill">{opp.stage}</span>
            </div>
            <div className="text-sm text-slate-300">
              {opp.status || "OPEN"} · {opp.owner || "Unassigned"}
            </div>
            <div className="text-sm text-slate-200">
              {opp.value ? `${opp.value} ${opp.currency ?? "EGP"}` : "Value TBD"}
              {opp.probability != null ? ` · Prob: ${opp.probability}%` : ""}
            </div>
            <div className="text-xs text-slate-400">
              {opp.closeDate ? `Close: ${opp.closeDate}` : "Close date TBD"}
            </div>
            {opp.notes && <p className="text-sm text-slate-300 mt-1">{opp.notes}</p>}
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
          <div className="text-white font-semibold">Add opportunity</div>
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
                <label className="text-sm text-slate-200" htmlFor="stage">Stage</label>
                <select id="stage" name="stage" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white">
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Contract">Contract</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="status">Status</label>
                <select id="status" name="status" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white">
                  <option value="OPEN">Open</option>
                  <option value="ON HOLD">On hold</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="value">Value</label>
                <input id="value" name="value" type="number" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="currency">Currency</label>
                <input id="currency" name="currency" defaultValue="EGP" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="probability">Probability (%)</label>
                <input id="probability" name="probability" type="number" min="0" max="100" step="5" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="closeDate">Close date</label>
                <input id="closeDate" name="closeDate" type="date" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200" htmlFor="owner">Owner</label>
              <input id="owner" name="owner" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200" htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" rows={3} className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={handleToggle} className="btn-ghost text-sm">Cancel</button>
              <button type="submit" className="btn-primary text-sm">Save opportunity</button>
            </div>
          </form>

          {confirmClose && (
            <div className="mt-4 card p-3 text-sm text-slate-200">
              <p>Discard unsaved changes?</p>
              <div className="flex gap-2 mt-2">
                <button className="btn-ghost text-sm" onClick={confirmCloseYes}>Discard</button>
                <button className="btn-primary text-sm" onClick={confirmCloseNo}>Keep editing</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
