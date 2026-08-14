import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "navy" | "outline" | "ghost";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: "btn-primary",
    navy: "btn-navy",
    outline: "btn-outline border-navy text-navy hover:bg-navy hover:text-white",
    ghost: "inline-flex items-center gap-2 px-3 py-2 text-sm hover:bg-cream",
  };
  return <button className={cn(styles[variant], className)} {...props} />;
}
