export const commonSchemas = {
  ErrorResponse: {
    type: "object",
    properties: {
      error: { type: "string" },
    },
  },
};

export const idParam = (description: string) => ({
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer" },
  description,
});

export const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
  },
});
