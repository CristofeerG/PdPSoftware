/**
 * Cliente simple para probar los eventos de Socket.io del backend.
 *
 * Uso:
 *   node scripts/socket-test-client.js [mesaId]
 *
 * Ejemplos:
 *   node scripts/socket-test-client.js        -> solo escucha mesas y stock (rooms automaticas)
 *   node scripts/socket-test-client.js 1      -> ademas se une a la sala de la mesa con id 1
 *
 * Variable de entorno opcional:
 *   SOCKET_URL (por defecto http://localhost:3000)
 */
const { io } = require("socket.io-client");

const url = process.env.SOCKET_URL || "http://localhost:3000";
const mesaId = process.argv[2] ? Number(process.argv[2]) : null;

const socket = io(url);

socket.on("connect", () => {
  console.log(`Conectado (${socket.id}) a ${url}`);
  console.log("Unido automaticamente a las salas 'mesas' y 'stock'.");

  if (mesaId) {
    socket.emit("mesa:unirse", mesaId);
    console.log(`Uniendome a la sala de la mesa con id ${mesaId}...`);
  } else {
    console.log(
      "Tip: pasa el id de una mesa como argumento para ver tambien sus eventos de consumo, ej:\n" +
        "  node scripts/socket-test-client.js 1",
    );
  }
});

socket.on("connect_error", (err) => {
  console.error("Error de conexion:", err.message);
});

socket.on("disconnect", () => console.log("Desconectado del servidor"));

const eventos = [
  "mesa:actualizada",
  "cuenta:abierta",
  "cuenta:item-agregado",
  "cuenta:item-editado",
  "cuenta:item-eliminado",
  "cuenta:cerrada",
  "insumo:stock-bajo",
];

for (const evento of eventos) {
  socket.on(evento, (payload) => {
    console.log(`\n[${evento}]`);
    console.log(JSON.stringify(payload, null, 2));
  });
}
