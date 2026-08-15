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
      <p className="eyebrow">Just a moment</p>
      <h1 className="mt-2 font-display text-3xl">This page is taking a second to load</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Please tap Try again. The site will come back on the next try.
      </p>
      <button type="button" className="btn-primary mt-6" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
