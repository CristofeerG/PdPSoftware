import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "insumos", label: "Insumos" },
  { to: "categorias", label: "Categorías" },
  { to: "productos-venta", label: "Productos de venta" },
];

const tabClases = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-dorado text-fondo" : "bg-superficie text-texto-secundario hover:text-texto"
  }`;

export function InventarioLayout() {
  return (
    <div className="flex flex-col gap-4">
      <nav className="flex gap-2 overflow-x-auto pb-1">
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
