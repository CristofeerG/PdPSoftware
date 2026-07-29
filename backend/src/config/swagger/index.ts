import { commonSchemas } from "./common";
import { authTags, authSchemas, authPaths } from "./auth";
import { inventarioTags, inventarioSchemas, inventarioPaths } from "./inventario";
import { reportesTags, reportesSchemas, reportesPaths } from "./reportes";
import { mesasTags, mesasSchemas, mesasPaths } from "./mesas";

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Bar Karaoke API",
    version: "0.1.0",
    description:
      "API de inventario y gestion de mesas del bar karaoke. Los endpoints se iran agregando modulo por modulo.",
  },
  servers: [{ url: "/api" }],
  tags: [...authTags, ...inventarioTags, ...mesasTags, ...reportesTags],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ...commonSchemas,
      ...authSchemas,
      ...inventarioSchemas,
      ...mesasSchemas,
      ...reportesSchemas,
    },
  },
  paths: {
    ...authPaths,
    ...inventarioPaths,
    ...mesasPaths,
    ...reportesPaths,
  },
};

export const swaggerUiOptions = {
  explorer: true,
};
