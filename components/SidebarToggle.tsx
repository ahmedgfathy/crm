"use client";

import { useEffect, useState } from "react";

const KEY = "ctb_sidebar";
type SidebarState = "collapsed" | "expanded";

function applySidebar(state: SidebarState) {
  if (typeof document === "undefined") return;
  document.body.dataset.sidebar = state;
}

export default function SidebarToggle() {
  const [state, setState] = useState<SidebarState>("collapsed");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && window.localStorage.getItem(KEY)) as SidebarState | null;
    const initial = stored === "expanded" ? "expanded" : "collapsed";
    setState(initial);
    applySidebar(initial);
  }, []);

  const toggle = () => {
    const next: SidebarState = state === "collapsed" ? "expanded" : "collapsed";
    setState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, next);
    }
    applySidebar(next);
  };

  const isCollapsed = state === "collapsed";
  const label = isCollapsed ? "Expand sidebar" : "Collapse sidebar";
  const icon = isCollapsed ? "»" : "«";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="px-3 py-2 text-sm rounded-lg border border-white/5 hover:bg-white/5 text-white sidebar-toggle"
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
