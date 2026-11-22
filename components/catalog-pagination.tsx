"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";

function PageLink({ page, label, children }: { page: number; label: string; children: ReactNode }) {
  return (
    <Link
      href={page === 1 ? "/" : `/?page=${page}`}
      scroll={false}
      prefetch={false}
      aria-label={label}
      className="catalog-page-link"
      onNavigate={() => {
        document.getElementById("personajes")?.scrollIntoView({ block: "start" });
        document.getElementById("catalog-title")?.focus({ preventScroll: true });
      }}
    >
      {children}
    </Link>
  );
}

export function CatalogPagination({ page, pages, label }: { page: number; pages: number; label: string }) {
  if (pages < 2) return null;

  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  const nearby = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const visiblePages = [...new Set([1, ...nearby, pages])];

  return (
    <nav aria-label={label} className="catalog-pagination">
      {page > 1 && <PageLink page={page - 1} label="Página anterior">‹</PageLink>}
      {visiblePages.map((number, index) => (
        <Fragment key={number}>
          {index > 0 && number - visiblePages[index - 1] > 1 && <span aria-hidden="true">…</span>}
          {number === page ? (
            <span className="catalog-page-link" aria-current="page">
              {number}
            </span>
          ) : (
            <PageLink page={number} label={`Ir a la página ${number}`}>{number}</PageLink>
          )}
        </Fragment>
      ))}
      {page < pages && <PageLink page={page + 1} label="Página siguiente">›</PageLink>}
    </nav>
  );
}
