"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="eyebrow">Temporary snag</p>
      <h1 className="mt-2 font-display text-3xl">The page could not load</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        This is usually the database connection on the live server. Check DB_HOST / DATABASE_URL, then try again.
      </p>
      {error.digest ? <p className="mt-2 text-xs text-muted">Ref {error.digest}</p> : null}
      <button type="button" className="btn-primary mt-6" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
