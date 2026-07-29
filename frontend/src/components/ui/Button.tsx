import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "danger" | "secondary" | "ghost";

const variantClases: Record<Variant, string> = {
  primary: "bg-dorado text-fondo hover:opacity-90",
  danger: "bg-rojo text-texto hover:opacity-90",
  secondary: "bg-black/30 text-texto hover:bg-black/40",
  ghost: "text-texto-secundario hover:text-texto",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${variantClases[variant]} ${className}`}
      {...props}
    />
  );
}
