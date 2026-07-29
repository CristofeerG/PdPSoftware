import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument, swaggerUiOptions } from "./config/swagger";
import { authRouter } from "./modules/auth/auth.routes";
import { categoriasRouter } from "./modules/inventario/categorias.routes";
import { insumosRouter } from "./modules/inventario/insumos.routes";
import { productosVentaRouter } from "./modules/inventario/productos-venta.routes";
import { reportesRouter } from "./modules/reportes/reportes.routes";
import { mesasRouter } from "./modules/mesas/mesas.routes";
import { cuentasRouter } from "./modules/mesas/cuentas.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/insumos", insumosRouter);
app.use("/api/productos-venta", productosVentaRouter);
app.use("/api/reportes", reportesRouter);
app.use("/api/mesas", mesasRouter);
app.use("/api/cuentas", cuentasRouter);

// Sirve el build de produccion del frontend (frontend/dist) desde este mismo
// servidor. En desarrollo esa carpeta no existe todavia (se usa el dev
// server de Vite en su lugar), asi que esto simplemente no se activa.
const frontendDist = path.join(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path === "/health") {
      return next();
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});
