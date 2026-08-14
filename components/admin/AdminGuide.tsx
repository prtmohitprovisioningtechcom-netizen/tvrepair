export function AdminGuide({
  title = "What this changes on the website",
  changes,
}: {
  title?: string;
  changes: string[];
}) {
  return (
    <div className="rounded-2xl border border-copper/25 bg-cream px-4 py-3.5">
      <p className="text-sm font-semibold text-navy">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm leading-6 text-muted">
        {changes.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
