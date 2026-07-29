import type { Rol } from "../context/AuthContext";

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  usuario: string;
  rol: Rol;
  activo: boolean;
  createdAt: string;
}
