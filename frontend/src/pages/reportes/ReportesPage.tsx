import { useState } from "react";
import { ResumenReporte } from "./ResumenReporte";
import { VentasReporte } from "./VentasReporte";
import { ProductosReporte } from "./ProductosReporte";
import { CierreCajaReporte } from "./CierreCajaReporte";
import { InventarioValorizadoReporte } from "./InventarioValorizadoReporte";

type Tab = "resumen" | "ventas" | "productos" | "caja" | "inventario";

const TABS: { id: Tab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "ventas", label: "Ventas" },
  { id: "productos", label: "Productos" },
  { id: "caja", label: "Cierre de caja" },
  { id: "inventario", label: "Inventario valorizado" },
];

export function ReportesPage() {
  const [tab, setTab] = useState<Tab>("resumen");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-texto">Reportes</h1>

      <div className="flex flex-wrap gap-2 border-b border-black/30 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-dorado text-fondo" : "text-texto-secundario hover:text-texto"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "resumen" && <ResumenReporte />}
      {tab === "ventas" && <VentasReporte />}
      {tab === "productos" && <ProductosReporte />}
      {tab === "caja" && <CierreCajaReporte />}
      {tab === "inventario" && <InventarioValorizadoReporte />}
    </div>
  );
}
