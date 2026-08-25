import { useId, useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const campoClases =
  "w-full rounded-md border border-black/20 bg-fondo px-3 py-2 text-texto placeholder:text-texto-secundario focus:border-dorado focus:outline-hidden focus:ring-1 focus:ring-dorado disabled:opacity-50";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${campoClases} ${props.className ?? ""}`} />;
}

export function PasswordInput({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  const idBoton = useId();

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${campoClases} pr-10 ${className ?? ""}`}
      />
      <button
        type="button"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
        id={idBoton}
        onClick={() => setVisible((actual) => !actual)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-texto-secundario hover:text-texto"
        tabIndex={-1}
      >
        {visible ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5a10.45 10.45 0 0 0 4.293-.914m3.32-2.089A10.45 10.45 0 0 0 22.066 12c-1.292-4.338-5.31-7.5-10.066-7.5a10.45 10.45 0 0 0-2.516.303" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-5.999.001A3 3 0 0 1 15 12Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${campoClases} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${campoClases} ${props.className ?? ""}`} />;
}
