import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "insumos", label: "Insumos" },
  { to: "categorias", label: "Categorías" },
  { to: "productos-venta", label: "Productos de venta" },
];

const tabClases = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    // text-fondo (y luego --text-on-gold) se seguian viendo poco distinguibles
    // sobre bg-dorado en ambos temas. Blanco fijo es el que mejor se distingue
    // del amarillo/dorado sin depender de tokens que cambian por tema.
    isActive ? "bg-dorado text-white" : "bg-superficie text-texto-secundario hover:text-texto"
  }`;

export function InventarioLayout() {
  return (
    <div className="flex flex-col gap-4">
      <nav className="inventario-tabs flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={tabClases}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
