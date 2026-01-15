"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "ctb_theme";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && window.localStorage.getItem(THEME_KEY)) as Theme | null;
    const next = stored === "light" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, next);
    }
    applyTheme(next);
  };

  const icon = theme === "dark" ? "🌞" : "🌙";
  const label = theme === "dark" ? "Switch to light" : "Switch to dark";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggle}
      className="px-3 py-2 text-lg rounded-lg hover:bg-white/5 border border-white/5 text-white"
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
