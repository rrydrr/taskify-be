# Taskify BE

A task management REST API built with [Elysia.js](https://elysiajs.com), [Bun](https://bun.sh), [Drizzle ORM](https://orm.drizzle.team), and [Neon PostgreSQL](https://neon.tech).

## Tech Stack

- **Runtime:** Bun
- **Framework:** Elysia.js
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM
- **Language:** TypeScript

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- A PostgreSQL database (e.g. [Neon](https://neon.tech))

### Installation

```bash
bun install
```

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable       | Description                          |
| -------------- | ------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string         |
| `API_KEY`      | Secret key for API authentication    |
| `PORT`         | Server port (optional, default 8080) |

### Database Setup

Generate and run migrations:

```bash
bun run db:generate
bun run db:migrate
```

Optionally seed the database:

```bash
bun run seed
```

### Running the Server

```bash
bun run start
```

The server starts on `http://localhost:8080` (or the port specified in `PORT`).

## Authentication

All endpoints require an `x-api-key` header matching the configured `API_KEY` environment variable.

```
x-api-key: your_api_key
```

Requests without a valid key receive a `401 Unauthorized` response.

## API Endpoints

### Create a Task

```
POST /tasks
```

**Body:**

| Field         | Type   | Required | Notes                                           |
| ------------- | ------ | -------- | ----------------------------------------------- |
| `title`       | string | yes      | 1–255 characters                                |
| `description` | string | no       | max 10,000 characters                           |
| `status`      | string | no       | `pending` (default), `in_progress`, `completed` |
| `priority`    | string | no       | `low`, `medium` (default), `high`               |

**Response:** `201 Created`

### Get a Task

```
GET /tasks/:id
```

**Response:** `200 OK` or `404 Not Found`

### List Tasks

```
GET /tasks
```

**Query Parameters:**

| Param      | Type   | Default | Notes                                 |
| ---------- | ------ | ------- | ------------------------------------- |
| `page`     | number | 1       | min 1                                 |
| `limit`    | number | 10      | min 1, max 100                        |
| `status`   | string | —       | `pending`, `in_progress`, `completed` |
| `priority` | string | —       | `low`, `medium`, `high`               |

**Response:** `200 OK` with paginated results and metadata.

### Update a Task

```
PATCH /tasks/:id
```

**Body:** Same fields as create, all optional. At least one field must be provided.

**Response:** `200 OK` or `404 Not Found`

### Delete a Task

```
DELETE /tasks/:id
```

**Response:** `200 OK` or `404 Not Found`

## Response Format

All responses follow a consistent envelope:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "error message" }
```

## Scripts

| Script                | Description                  |
| --------------------- | ---------------------------- |
| `bun run start`       | Start the server             |
| `bun run seed`        | Seed the database            |
| `bun run db:generate` | Generate Drizzle migrations  |
| `bun run db:migrate`  | Run Drizzle migrations       |
| `bun run typecheck`   | Run TypeScript type checking |

## Project Structure

```
src/
├── db/
│   ├── index.ts          # Database connection
│   ├── schema.ts         # Drizzle table definitions
│   └── seed.ts           # Database seeder
├── middlewares/
│   └── useApiKey.ts      # API key authentication
├── models/
│   └── tasks.model.ts    # Task model types
├── modules/
│   └── tasks/
│       ├── index.ts      # Route definitions
│       └── service/
│           └── index.ts  # Business logic
├── tests/                # Test files
├── utils/
│   └── response.ts       # Response helpers
└── index.ts              # App entrypoint
```

## Testing

```bash
bun test
```
