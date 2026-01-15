"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Property = {
  id: string;
  title: string;
  type: string;
  status: string;
  price: number | null;
  currency: string | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  areaUnit: string | null;
  description: string | null;
};

type ActionState = {
  ok: boolean;
  message?: string;
  error?: string;
};

type Filters = {
  search?: string;
  type?: string;
  status?: string;
};

export default function PropertiesClient({
  properties,
  filters,
  action,
}: {
  properties: Property[];
  filters: Filters;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {
    ok: false,
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setDirty(false);
      setOpen(false);
    }
  }, [state.ok]);

  const handleToggle = () => {
    if (!open) {
      setOpen(true);
      return;
    }
    if (dirty) {
      setConfirmClose(true);
    } else {
      setOpen(false);
    }
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
            placeholder="Search by title, description, region"
            className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white w-64"
          />
          <select
            name="type"
            defaultValue={filters.type ?? ""}
            className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
          >
            <option value="">All types</option>
            <option value="APARTMENT">Apartment</option>
            <option value="VILLA">Villa</option>
            <option value="TOWNHOUSE">Townhouse</option>
            <option value="OFFICE">Office</option>
            <option value="RETAIL">Retail</option>
            <option value="LAND">Land</option>
            <option value="WAREHOUSE">Warehouse</option>
          </select>
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
          >
            <option value="">All status</option>
            <option value="AVAILABLE">Available</option>
            <option value="UNDER_CONTRACT">Under Contract</option>
            <option value="SOLD">Sold</option>
            <option value="RENTED">Rented</option>
          </select>
          <button type="submit" className="btn-ghost text-sm">Filter</button>
        </form>

        <button onClick={handleToggle} className="btn-primary text-sm">Add new</button>
      </div>

      {state.ok && (
        <div className="card border-green-500/30 bg-green-500/10 text-green-100 p-4 text-sm">
          {state.message ?? "Property saved."}
        </div>
      )}
      {state.error && (
        <div className="card border-red-500/30 bg-red-500/10 text-red-100 p-4 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {properties.length === 0 && (
          <div className="card p-4 text-sm text-slate-300">No properties yet. Add your first one.</div>
        )}
        {properties.map((p) => (
          <div key={p.id} className="card p-5 flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-white">{p.title}</div>
              <span className="pill">{p.status}</span>
            </div>
            <div className="text-sm text-slate-300">
              {p.type} · {p.city || "Region not set"}
            </div>
            <div className="text-sm text-slate-200">
              {p.price ? `${p.price} ${p.currency ?? "EGP"}` : "Price on request"}
            </div>
            <div className="text-xs text-slate-400">
              {p.bedrooms ?? "-"} bd · {p.bathrooms ?? "-"} ba · {p.area ?? "-"} {p.areaUnit ?? "sqm"}
            </div>
            {p.description && <p className="text-sm text-slate-300 mt-1">{p.description}</p>}
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
          <div className="text-white font-semibold">Add property</div>
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
                <label className="text-sm text-slate-200" htmlFor="type">Type *</label>
                <select id="type" name="type" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" required>
                  <option value="APARTMENT">Apartment</option>
                  <option value="VILLA">Villa</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="OFFICE">Office</option>
                  <option value="RETAIL">Retail</option>
                  <option value="LAND">Land</option>
                  <option value="WAREHOUSE">Warehouse</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="status">Status</label>
                <select id="status" name="status" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white">
                  <option value="AVAILABLE">Available</option>
                  <option value="UNDER_CONTRACT">Under Contract</option>
                  <option value="SOLD">Sold</option>
                  <option value="RENTED">Rented</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="price">Price</label>
                <input id="price" name="price" type="number" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="currency">Currency</label>
                <input id="currency" name="currency" defaultValue="EGP" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="bedrooms">Bedrooms</label>
                <input id="bedrooms" name="bedrooms" type="number" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="bathrooms">Bathrooms</label>
                <input id="bathrooms" name="bathrooms" type="number" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="area">Area</label>
                <input id="area" name="area" type="number" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="areaUnit">Area unit</label>
                <input id="areaUnit" name="areaUnit" defaultValue="sqm" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="region">Region</label>
                <input id="region" name="region" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200" htmlFor="description">Description</label>
              <textarea id="description" name="description" rows={3} className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={handleToggle} className="btn-ghost text-sm">Cancel</button>
              <button type="submit" className="btn-primary text-sm">Save property</button>
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
