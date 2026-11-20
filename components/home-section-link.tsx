"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

type HomeSection = "inicio" | "personajes" | "buscar";

function scrollToSection(section: HomeSection) {
  if (section === "inicio") {
    window.scrollTo({ top: 0 });
  } else {
    document.getElementById(section)?.scrollIntoView({ block: "start" });
  }
}

export function HomeSectionLink({ section, children }: { section: HomeSection; children: ReactNode }) {
  const pathname = usePathname();
  const pendingScroll = useRef(false);

  useEffect(() => {
    if (pathname !== "/" || !pendingScroll.current) return;
    pendingScroll.current = false;
    scrollToSection(section);
  }, [pathname, section]);

  return (
    <Link
      href="/"
      className="header-link"
      scroll={false}
      onNavigate={(event) => {
        if (pathname !== "/") {
          pendingScroll.current = true;
          return;
        }

        event.preventDefault();
        const { pathname: path, search, hash } = window.location;
        if (hash) window.history.replaceState(window.history.state, "", path + search);
        scrollToSection(section);
      }}
    >
      {children}
    </Link>
  );
}
