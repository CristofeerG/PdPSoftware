import { useState } from "react";
import { Button } from "./Button";

interface ConfirmButtonProps {
  onConfirm: () => void;
  label?: string;
  disabled?: boolean;
}

/** Botón "Eliminar" que pide una confirmación inline antes de disparar la acción. */
export function ConfirmButton({ onConfirm, label = "Eliminar", disabled }: ConfirmButtonProps) {
  const [confirmando, setConfirmando] = useState(false);

  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-1">
        <Button
          type="button"
          variant="danger"
          className="px-2 py-1"
          onClick={() => {
            setConfirmando(false);
            onConfirm();
          }}
        >
          Confirmar
        </Button>
        <Button type="button" variant="ghost" className="px-2 py-1" onClick={() => setConfirmando(false)}>
          Cancelar
        </Button>
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="px-2 py-1 text-rojo hover:text-rojo"
      disabled={disabled}
      onClick={() => setConfirmando(true)}
    >
      {label}
    </Button>
  );
}
