import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export const ROOMS = {
  mesasOverview: "mesas",
  stockAlerts: "stock",
  mesa: (mesaId: number) => `mesa:${mesaId}`,
};

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    // Todos reciben el estado general de mesas y las alertas de stock:
    // son eventos poco frecuentes, no hace falta que el cliente se suscriba.
    socket.join(ROOMS.mesasOverview);
    socket.join(ROOMS.stockAlerts);

    // El detalle de una mesa (items agregados/editados/quitados) si es
    // frecuente, por eso requiere unirse explicitamente a su sala.
    socket.on("mesa:unirse", (mesaId: number) => {
      socket.join(ROOMS.mesa(mesaId));
    });

    socket.on("mesa:salir", (mesaId: number) => {
      socket.leave(ROOMS.mesa(mesaId));
    });
  });

  return io;
}

export function getIo(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io no ha sido inicializado (initSocket no fue llamado)");
  }
  return io;
}
