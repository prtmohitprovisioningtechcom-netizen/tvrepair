import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-line bg-white">
      <ol className="container-wide flex flex-wrap items-center gap-1 overflow-x-auto py-2.5 text-xs text-muted sm:py-3 sm:text-sm">
        {items.map((item, i) => (
          <li key={item.href} className="flex max-w-full items-center gap-1">
            {i > 0 ? <ChevronRight size={14} className="shrink-0" /> : null}
            {i === items.length - 1 ? (
              <span className="max-w-[70vw] truncate text-ink sm:max-w-none">{item.name}</span>
            ) : (
              <Link href={item.href} className="shrink-0 hover:text-ink">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
