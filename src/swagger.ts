import swaggerUi from "swagger-ui-express";
import type { RequestHandler } from "express";

const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
    },
  },
});

const makeTodoPaths = (basePath: "/api/todo" | "/api/todos") => ({
  [basePath]: {
    get: {
      tags: ["Todos"],
      summary: "List the authenticated user's todos",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        "200": {
          description: "Todos returned",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Todo" },
                  },
                },
                required: ["data"],
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    post: {
      tags: ["Todos"],
      summary: "Create a todo",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateTodo" },
          },
        },
      },
      responses: {
        "201": {
          description: "Todo created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTodo" },
            },
          },
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  [`${basePath}/{id}`]: {
    put: {
      tags: ["Todos"],
      summary: "Update a todo",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "MongoDB todo ID",
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateTodo" },
          },
        },
      },
      responses: {
        "200": {
          description: "Todo updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Todo" },
            },
          },
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      tags: ["Todos"],
      summary: "Delete a todo",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "MongoDB todo ID",
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
        },
      ],
      responses: {
        "200": {
          description: "Todo deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string" } },
                required: ["message"],
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },
});

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Node.js Backend API",
    version: "1.0.0",
    description: "API documentation for user authentication and todo management.",
  },
  servers: [{ url: "/", description: "Current server" }],
  tags: [
    { name: "Users", description: "Authentication and user management" },
    { name: "Todos", description: "Todo management" },
  ],
  paths: {
    "/api/users/login": {
      post: {
        tags: ["Users"],
        summary: "Log in",
        description:
          "On success, sets the accessToken and refreshToken HTTP-only cookies.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserCredentials" },
            },
          },
        },
        responses: {
          "200": {
            description: "Logged in; authentication cookies are set",
            headers: {
              "Set-Cookie": {
                description: "HTTP-only accessToken and refreshToken cookies",
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PublicUser" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/users/register": {
      post: {
        tags: ["Users"],
        summary: "Register a user",
        description:
          "Creates the user, assigns the requested role (or USER by default), and sets authentication cookies.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterUser" },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered; authentication cookies are set",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PublicUser" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/api/users/refresh": {
      post: {
        tags: ["Users"],
        summary: "Refresh the access token",
        description: "Requires the current accessToken cookie and a refresh token.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { refreshToken: { type: "string" } },
                required: ["refreshToken"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Access token refreshed; accessToken cookie is updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { mesage: { type: "string" } },
                  required: ["mesage"],
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/api/users/logout": {
      get: {
        tags: ["Users"],
        summary: "Log out",
        description: "Revokes the active session and clears authentication cookies.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          "200": {
            description: "Logged out",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Message" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    
    },
    "/api/users/datas": {
      get: {
        tags: ["Users"],
        summary: "Get a paginated user list",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Page number (defaults to 1)",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Users per page (defaults to 10)",
            schema: { type: "integer", minimum: 1, default: 10 },
          },
        ],
        responses: {
          "200": {
            description: "User page returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    Data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/PublicUser" },
                    },
                    pageNo: { type: "integer" },
                    remainingPages: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                  required: ["Data", "pageNo", "remainingPages", "totalPages"],
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    ...makeTodoPaths("/api/todo"),
    ...makeTodoPaths("/api/todos"),
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
          stack: { type: "string", nullable: true },
        },
        required: ["message", "stack"],
      },
      Message: {
        type: "object",
        properties: { message: { type: "string" } },
        required: ["message"],
      },
      UserCredentials: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
        },
        required: ["email", "password"],
      },
      RegisterUser: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 3 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          role: { type: "string", enum: ["USER", "ADMIN"] },
          roles: {
            type: "array",
            items: {
              oneOf: [
                { type: "string", enum: ["USER", "ADMIN"] },
                { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
              ],
            },
          },
        },
        required: ["name", "email", "password"],
      },
      PublicUser: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          roles: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["_id", "name", "email"],
      },
      CreateTodo: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
      },
      UpdateTodo: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: ["not-started", "in-progress", "done"],
          },
        },
        required: ["title", "description", "status"],
      },
      Todo: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: ["not-started", "in-progress", "done"],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
    responses: {
      BadRequest: errorResponse("Invalid request"),
      Unauthorized: errorResponse("Authentication required or token invalid"),
      Forbidden: errorResponse("Insufficient permissions or not the todo owner"),
      NotFound: errorResponse("Resource not found"),
    },
  },
};

export const swaggerUiMiddleware: RequestHandler[] = [
  ...swaggerUi.serve,
  swaggerUi.setup(openApiSpec),
];
