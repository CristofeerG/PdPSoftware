import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  error?: string;
}

export function Field({ label, htmlFor, children, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-texto-secundario">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-rojo">{error}</p>}
    </div>
  );
}
