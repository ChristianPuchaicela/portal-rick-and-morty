"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RequestRetry({ pendingMessage }: { pendingMessage: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-4">
      <button
        type="button"
        className="search-submit"
        aria-disabled={pending}
        onClick={() => {
          if (!pending) startTransition(() => router.refresh());
        }}
      >
        Reintentar
      </button>
      <p role="status" className="mt-2 text-sm text-muted-foreground">
        {pending ? pendingMessage : ""}
      </p>
    </div>
  );
}
