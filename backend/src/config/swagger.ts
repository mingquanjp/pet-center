import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pet Center API",
      version: "1.0.0",
      description: "API documentation for the Pet Center backend."
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Local development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { nullable: true },
            message: { type: "string", example: "Thành công" }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "NOT_FOUND" },
                message: { type: "string", example: "Không tìm thấy tài nguyên" },
                details: {
                  type: "array",
                  items: { type: "object" }
                }
              },
              required: ["code", "message"]
            }
          },
          required: ["success", "error"]
        }
      }
    }
  },
  apis: ["./src/modules/**/*.routes.ts"]
});
