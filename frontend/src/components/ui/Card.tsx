import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-2xl bg-superficie p-4 sm:p-6 ${className}`} {...props} />;
}
