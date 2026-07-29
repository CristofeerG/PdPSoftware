import "dotenv/config";
import { createServer } from "http";
import { app } from "./app";
import { initSocket } from "./lib/socket";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
  console.log(`Swagger UI disponible en http://localhost:${port}/api-docs`);
  console.log(`Socket.io disponible en el mismo puerto (ws://localhost:${port})`);
});
