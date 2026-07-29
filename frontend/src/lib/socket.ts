import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/** Socket compartido para toda la app: se conecta una sola vez, al origen actual (via el proxy de Vite). */
export function getSocket(): Socket {
  if (!socket) {
    socket = io();
  }
  return socket;
}
