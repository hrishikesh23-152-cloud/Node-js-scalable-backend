# Node.js Scalable Backend

A TypeScript REST API for user authentication and todo management. It uses Express, MongoDB, and Redis, with JWT-based authentication and role-aware authorization.

## API documentation

Open the interactive Swagger UI at [http://3.111.52.104:4000/api-docs/](http://3.111.52.104:4000/api-docs/).

## Features

- User registration, login, token refresh, and logout
- HTTP-only access and refresh token cookies
- Todo CRUD endpoints, scoped to the authenticated user
- Paginated user listing
- MongoDB persistence and Redis caching with expiration and invalidation
- Zod request validation and strict TypeScript type checking
- Centralized error handling and Winston logging
- Dockerfile and Docker Compose setup for the API and Redis

## Requirements

- Node.js 22 or later
- pnpm
- MongoDB
- Redis

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env` file in the project root and set the required configuration (see below).

3. Start MongoDB and Redis, then run the development server:

   ```bash
   pnpm dev
   ```

The API listens on port `4000` by default. Set `PORT` to use another port.

## Engineering highlights

### Logging

The Winston logger writes to the console and to daily rotated log files in `logs/`. File logs are JSON-formatted, compressed after rotation, limited to 20 MB per file, and retained for 14 days. The configured log level is `debug` in development and `warn` otherwise; exceptions are also routed to the file transport.

### Input validation and type safety

Zod schemas validate user registration, login, and refresh-token request bodies through shared validation middleware. TypeScript runs with `strict` mode enabled, with typed Express handlers and cache data models. Todo request fields are also checked in their controller handlers.

### Error handling

A centralized Express error middleware handles application errors and unknown routes, logs request context, and returns a JSON response with a message and stack field. Stack traces are included only in development. Invalid MongoDB document IDs are translated to a not-found response.

### Redis caching and eviction

Redis caches per-user todo lists and paginated user-list results. Cached entries expire after the configured `CACHING_TTL` (in milliseconds). Todo entries are deleted after a todo is created, updated, or removed. User-list cache keys include a version; registering a user increments that version so subsequent requests use fresh keys, while older entries expire by TTL.

### Tests

Tests use Vitest and cover registration, authentication, protected routes, and registration unit behavior. The test configuration runs the compiled tests from `dist/test`, so build before running the test suite:

```bash
pnpm build
pnpm test
```

### Environment variables

Configure these values in `.env`:

| Variable | Purpose |
| --- | --- |
| `DB_URI` | MongoDB connection URI |
| `TOKEN_SECRET` | Secret used to sign and validate tokens |
| `TOKEN_ISSUER` | JWT issuer |
| `TOKEN_AUDIENCE` | JWT audience |
| `TOKEN_ALGORITHM` | JWT signing algorithm |
| `ACCESS_TOKEN_VALIDITY_SEC` | Access-token lifetime in seconds |
| `REFRESH_TOKEN_VALIDITY_SEC` | Refresh-token lifetime in seconds |
| `REDIS_HOST` | Redis hostname (`redis` when using the Compose network) |
| `REDIS_PORT` | Redis port, usually `6379` |
| `REDIS_PASSWORD` | Redis password |
| `CACHING_TTL` | Cache lifetime setting |
| `CORS_URL` | Allowed frontend origin |
| `PORT` | API port (defaults to `4000`) |
| `NODE_ENV` | Runtime environment |
| `DB_MIN_POOL_SIZE` | Minimum MongoDB connection pool size |
| `DB_MAX_POOL_SIZE` | Maximum MongoDB connection pool size |

Use your own strong token secret and appropriate credentials; do not commit `.env`.

## Docker Compose

The Dockerfile builds the TypeScript application and runs the compiled server. Docker Compose starts the backend and Redis; MongoDB is an external prerequisite and is not included in the Compose file. Set `DB_URI` to a MongoDB instance reachable by the backend. For the Compose Redis service, use `REDIS_HOST=redis`, `REDIS_PORT=6379`, and `REDIS_PASSWORD=password` (change the Compose Redis password for deployments).

```bash
docker compose up --build
```

## API overview

All routes are relative to the server origin. See Swagger for request and response schemas.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/users/register` | Register a user; sets authentication cookies |
| `POST` | `/api/users/login` | Log in; sets authentication cookies |
| `POST` | `/api/users/refresh` | Refresh the access token |
| `GET` or `POST` | `/api/users/logout` | Log out and clear authentication cookies |
| `GET` | `/api/users/datas?page=1&limit=10` | Get a paginated user list |
| `GET` | `/api/todo` or `/api/todos` | List the authenticated user's todos |
| `POST` | `/api/todo` or `/api/todos` | Create a todo |
| `PUT` | `/api/todo/:id` or `/api/todos/:id` | Update a todo |
| `DELETE` | `/api/todo/:id` or `/api/todos/:id` | Delete a todo |

Todo endpoints and the user-list endpoint require authentication. Login and registration return HTTP-only cookies; Swagger also documents bearer-token authentication for protected endpoints.

## Development commands

```bash
pnpm build       # Compile TypeScript
pnpm start       # Run the compiled server
pnpm test        # Run compiled tests with Vitest (run pnpm build first)
pnpm seed:roles  # Build and seed roles
pnpm seed:api-key # Build and seed an API key
```
