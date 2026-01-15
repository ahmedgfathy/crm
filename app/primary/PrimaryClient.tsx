"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";

export type PrimaryUnit = {
  id: string;
  title: string;
  type: string;
  status: string | null;
  price: number | null;
  currency: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  areaUnit: string | null;
  region: string | null;
  notes: string | null;
  projectId: string;
};

export type PrimaryProject = {
  id: string;
  name: string;
  region: string | null;
  status: string | null;
  description: string | null;
  createdAt: string;
  units: PrimaryUnit[];
};

export type Developer = {
  id: string;
  name: string;
  contact: string | null;
  brief: string | null;
  history: string | null;
  projects: PrimaryProject[];
};

type ActionState = {
  ok: boolean;
  message?: string;
  error?: string;
};

export default function PrimaryClient({
  developers,
  developerAction,
  projectAction,
  unitAction,
}: {
  developers: Developer[];
  developerAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  projectAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  unitAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [selectedDeveloperId, setSelectedDeveloperId] = useState(developers[0]?.id ?? "");
  const [selectedProjectId, setSelectedProjectId] = useState<string | "">(developers[0]?.projects[0]?.id ?? "");
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [showAddDeveloper, setShowAddDeveloper] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);

  const [devState, devFormAction] = useActionState<ActionState, FormData>(developerAction, { ok: false });
  const [projectState, projectFormAction] = useActionState<ActionState, FormData>(projectAction, { ok: false });
  const [unitState, unitFormAction] = useActionState<ActionState, FormData>(unitAction, { ok: false });

  const unitTrackRef = useRef<HTMLDivElement | null>(null);
  const projectTrackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const current = developers.find((d) => d.id === selectedDeveloperId);
    setSelectedProjectId(current?.projects[0]?.id ?? "");
  }, [developers, selectedDeveloperId]);

  useEffect(() => {
    if (devState.ok) setShowAddDeveloper(false);
  }, [devState.ok]);

  useEffect(() => {
    if (projectState.ok) setShowAddProject(false);
  }, [projectState.ok]);

  useEffect(() => {
    if (unitState.ok) setShowAddUnit(false);
  }, [unitState.ok]);

  const selectedDeveloper = useMemo(
    () => developers.find((d) => d.id === selectedDeveloperId) ?? null,
    [developers, selectedDeveloperId]
  );

  const projects = selectedDeveloper?.projects ?? [];
  const allProjects = useMemo(
    () => developers.flatMap((dev) => dev.projects.map((p) => ({ ...p, developer: dev.name }))),
    [developers]
  );
  const allUnits = useMemo(
    () =>
      developers.flatMap((dev) =>
        dev.projects.flatMap((project) =>
          project.units.map((unit) => ({
            ...unit,
            projectName: project.name,
            developerName: dev.name,
            projectStatus: project.status,
          }))
        )
      ),
    [developers]
  );

  const toggleProject = (id: string) => {
    setExpandedProjectId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const el = unitTrackRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;

    let raf: number;
    const step = () => {
      el.scrollLeft += 0.5;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [allUnits.length]);

  useEffect(() => {
    const el = projectTrackRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;

    let raf: number;
    const step = () => {
      el.scrollLeft += 0.4;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [allProjects.length]);

  return (
    <div className="space-y-8">
      <div className="card bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-white/5 p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="pill text-xs">Primary</p>
          <p className="muted text-sm">Developers → projects → units, all in one motion view.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="btn-primary"
            onClick={() => {
              setShowAddDeveloper(true);
              document.getElementById("add-developer")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Add new developer
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              setShowAddProject(true);
              document.getElementById("add-project")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Add new project
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-white">Newest units</p>
            <p className="text-xs text-slate-400">Auto sliding right → left</p>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-white/5 bg-slate-900/60 p-4">
            <div ref={unitTrackRef} className="flex gap-3 overflow-x-auto no-scrollbar" style={{ scrollBehavior: "auto" }}>
              {allUnits.length === 0 && <div className="text-sm text-slate-400">No units yet.</div>}
              {allUnits.map((unit) => (
                <div key={unit.id} className="min-w-[240px] max-w-[240px] rounded-lg border border-white/10 bg-white/5 p-3 text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{unit.title}</span>
                    <span className="pill text-xs">{unit.status ?? "AVAILABLE"}</span>
                  </div>
                  <div className="text-xs text-slate-300">{unit.type} · {unit.region || "Region"}</div>
                  <div className="text-xs text-slate-400">{unit.projectName} — {unit.developerName}</div>
                  <div className="text-xs text-slate-200">
                    {unit.price ? `${unit.price} ${unit.currency ?? "EGP"}` : "Price TBD"}
                    {" · "}
                    {unit.area ? `${unit.area} ${unit.areaUnit ?? "sqm"}` : "Area TBD"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-white">Projects on deck</p>
            <p className="text-xs text-slate-400">Auto sliding right → left</p>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-white/5 bg-slate-900/60 p-4">
            <div ref={projectTrackRef} className="flex gap-3 overflow-x-auto no-scrollbar" style={{ scrollBehavior: "auto" }}>
              {allProjects.length === 0 && <div className="text-sm text-slate-400">No projects yet.</div>}
              {allProjects.map((project) => (
                <div key={project.id} className="min-w-[260px] max-w-[260px] rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs uppercase text-slate-400">{project.developer}</p>
                      <p className="text-white font-semibold">{project.name}</p>
                    </div>
                    <span className="pill text-xs">{project.status ?? "Planned"}</span>
                  </div>
                  <p className="text-xs text-slate-300">{project.region || "Region not set"}</p>
                  {project.description && <p className="text-xs text-slate-200 line-clamp-2">{project.description}</p>}
                  <p className="text-[11px] text-slate-400">Units: {project.units.length}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {projectState.error && (
        <div className="card border-red-500/30 bg-red-500/10 text-red-100 p-3 text-sm">{projectState.error}</div>
      )}
      {projectState.ok && (
        <div className="card border-green-500/30 bg-green-500/10 text-green-100 p-3 text-sm">{projectState.message ?? "Project saved."}</div>
      )}
      {unitState.error && (
        <div className="card border-red-500/30 bg-red-500/10 text-red-100 p-3 text-sm">{unitState.error}</div>
      )}
      {unitState.ok && (
        <div className="card border-green-500/30 bg-green-500/10 text-green-100 p-3 text-sm">{unitState.message ?? "Unit saved."}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-slate-200" htmlFor="devSelect">Developer</label>
              <select
                id="devSelect"
                value={selectedDeveloperId}
                onChange={(e) => setSelectedDeveloperId(e.target.value)}
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
              >
                {developers.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name}
                  </option>
                ))}
                {developers.length === 0 && <option value="">No developers</option>}
              </select>
            </div>
            {selectedDeveloper ? (
              <div className="grid gap-2 text-sm text-slate-300">
                <div className="text-white font-semibold text-lg">{selectedDeveloper.name}</div>
                {selectedDeveloper.contact && <div>Contact: {selectedDeveloper.contact}</div>}
                {selectedDeveloper.brief && <div>Brief: {selectedDeveloper.brief}</div>}
                {selectedDeveloper.history && <div className="text-slate-400">History: {selectedDeveloper.history}</div>}
                <div className="text-xs text-slate-500">Projects: {projects.length}</div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">No developer selected.</div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Need a new developer?</p>
            <button className="btn-secondary" onClick={() => setShowAddDeveloper((v) => !v)}>
              {showAddDeveloper ? "Hide" : "Add developer"}
            </button>
          </div>
          <div
            id="add-developer"
            className={`card p-5 space-y-3 transition-all duration-300 ${showAddDeveloper ? "opacity-100" : "opacity-0 pointer-events-none -mt-2"}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-white">Add developer</p>
              {devState.ok && <span className="pill">Saved</span>}
            </div>
            {devState.error && (
              <div className="card border-red-500/30 bg-red-500/10 text-red-100 p-3 text-sm">{devState.error}</div>
            )}
            <form action={devFormAction} className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-slate-200" htmlFor="devName">Developer name *</label>
                <input id="devName" name="name" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="devContact">Contact</label>
                <input id="devContact" name="contact" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="devBrief">Brief</label>
                <input id="devBrief" name="brief" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-slate-200" htmlFor="devHistory">History</label>
                <textarea id="devHistory" name="history" rows={3} className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="btn-primary text-sm">Save developer</button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-white">Projects</p>
              <p className="text-xs text-slate-500">Tap to expand units</p>
            </div>
            <div className="grid gap-4">
              {projects.length === 0 && (
                <div className="card p-4 text-sm text-slate-300">No projects for this developer. Add one.</div>
              )}
              {projects.map((project) => {
                const expanded = expandedProjectId === project.id;
                return (
                  <div key={project.id} className="card p-5 space-y-3 border-white/10">
                    <button className="w-full text-left" onClick={() => toggleProject(project.id)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase text-slate-400 tracking-wide">Project</p>
                          <p className="text-lg font-semibold text-white">{project.name}</p>
                        </div>
                        <span className="pill">{project.status ?? "Planned"}</span>
                      </div>
                      <p className="text-sm text-slate-300">{project.region || "Region not set"}</p>
                      {project.description && <p className="text-sm text-slate-200">{project.description}</p>}
                      <div className="text-xs text-slate-500">Units: {project.units.length}</div>
                    </button>

                    {expanded && (
                      <div className="space-y-2">
                        {project.units.map((unit) => (
                          <div key={unit.id} className="rounded-lg border border-white/5 bg-white/5 p-3 text-sm space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium">{unit.title}</span>
                              <span className="pill text-xs">{unit.status ?? "AVAILABLE"}</span>
                            </div>
                            <div className="text-xs text-slate-300">{unit.type} · {unit.region || "Region"}</div>
                            <div className="text-xs text-slate-300">
                              {unit.price ? `${unit.price} ${unit.currency ?? "EGP"}` : "Price TBD"}
                              {" · "}
                              {unit.area ? `${unit.area} ${unit.areaUnit ?? "sqm"}` : "Area TBD"}
                            </div>
                          </div>
                        ))}
                        {project.units.length === 0 && (
                          <div className="rounded-lg border border-dashed border-white/10 p-3 text-xs text-slate-400">No units yet.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Need a new project?</p>
            <button className="btn-secondary" onClick={() => setShowAddProject((v) => !v)}>
              {showAddProject ? "Hide" : "Add project"}
            </button>
          </div>
          <div
            id="add-project"
            className={`card p-5 space-y-3 transition-all duration-300 ${showAddProject ? "opacity-100" : "opacity-0 pointer-events-none -mt-2"}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-white">Add project</p>
              {projectState.ok && <span className="pill">Saved</span>}
            </div>
            <form action={projectFormAction} className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="projectDeveloper">Developer *</label>
                <select
                  id="projectDeveloper"
                  name="developerId"
                  defaultValue={selectedDeveloperId}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
                  required
                >
                  <option value="" disabled>
                    Select developer
                  </option>
                  {developers.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="projectName">Project name *</label>
                <input id="projectName" name="name" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-slate-200" htmlFor="projectStatus">Status</label>
                  <input id="projectStatus" name="status" defaultValue="Planned" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-200" htmlFor="projectRegion">Region</label>
                  <input id="projectRegion" name="region" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="projectDescription">Description</label>
                <textarea id="projectDescription" name="description" rows={3} className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary text-sm">Save project</button>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Need a new unit?</p>
            <button className="btn-secondary" onClick={() => setShowAddUnit((v) => !v)}>
              {showAddUnit ? "Hide" : "Add unit"}
            </button>
          </div>
          <div className={`card p-5 space-y-3 transition-all duration-300 ${showAddUnit ? "opacity-100" : "opacity-0 pointer-events-none -mt-2"}`}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-white">Add unit</p>
              {unitState.ok && <span className="pill">Saved</span>}
            </div>
            <form action={unitFormAction} className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="unitProject">Project *</label>
                <select
                  id="unitProject"
                  name="projectId"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
                  required
                >
                  <option value="" disabled>
                    Select project
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="unitTitle">Unit title *</label>
                <input id="unitTitle" name="title" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-slate-200" htmlFor="unitType">Type *</label>
                  <input id="unitType" name="type" defaultValue="Apartment" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-200" htmlFor="unitStatus">Status</label>
                  <input id="unitStatus" name="status" defaultValue="AVAILABLE" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-slate-200" htmlFor="unitPrice">Price</label>
                  <input id="unitPrice" name="price" type="number" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-200" htmlFor="unitCurrency">Currency</label>
                  <input id="unitCurrency" name="currency" defaultValue="EGP" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-slate-200" htmlFor="unitBedrooms">Bedrooms</label>
                  <input id="unitBedrooms" name="bedrooms" type="number" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-200" htmlFor="unitBathrooms">Bathrooms</label>
                  <input id="unitBathrooms" name="bathrooms" type="number" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-200" htmlFor="unitArea">Area</label>
                  <input id="unitArea" name="area" type="number" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm text-slate-200" htmlFor="unitAreaUnit">Area unit</label>
                  <input id="unitAreaUnit" name="areaUnit" defaultValue="sqm" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-200" htmlFor="unitRegion">Region</label>
                  <input id="unitRegion" name="region" className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-200" htmlFor="unitNotes">Notes</label>
                <textarea id="unitNotes" name="notes" rows={3} className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white" />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary text-sm" disabled={!selectedProjectId}>Save unit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
