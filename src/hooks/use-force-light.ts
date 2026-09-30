import { useEffect } from "react";

/** Keeps a page in light mode regardless of the user's theme. */
export function useForceLight() {
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");

    root.classList.remove("dark");

    return () => {
      if (wasDark) root.classList.add("dark");
    };
  }, []);
}