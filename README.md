# Files Manager

A modern, scalable file management system with cloud storage integration, event
streaming, and a responsive web interface.

## Project Overview

Files Manager is a full-stack application that allows users to upload, view, and
delete files with a clean, intuitive interface.

## Features

- Upload files to secure cloud storage (S3 minio)
- View and delete uploaded files
- Event streaming with Kafka
- Responsive web interface

## Tech Stack

### Backend

- **Fastify**: High-performance web framework
- **tRPC**: End-to-end type-safe API
- **Prisma**: Modern database ORM
- **AWS S3 / minio**: Secure file storage
- **Kafka**: Event streaming and messaging
- **PostgreSQL**: Relation database

### Frontend

- **Next.js**: React framework for production
- **TailwindCSS**: Utility-first CSS framework
- **React**: UI library

### Infrastructure

- **pnpm Workspaces**: Monorepo management
- **Docker Compose**: Development environment orchestration

## Project Structure

```
files-manager/
├── apps/
│   ├── api/               # Backend API service
│   │   ├── prisma/        # Prisma schema and migrations
│   │   └── src/           # API source code
│   │       └── jobs/      # Scheduler tasks
│   │       ├── lib/       # Utility libraries (Prisma, S3, Kafka)
│   │       └── routers/   # tRPC routers
│   │       └── services/  # Split large logic into services
│   │       
│   └── web/               # Frontend Next.js application
│       ├── public/        # Static files
│       └── src/           # Next.js source code
│           ├── app/       # Next.js app router
│           ├── components/# React components
│           ├── contexts/  # React contexts
│           └── utils/     # Utility functions
└── packages/
    ├── shared/            # Shared utilities and validators
    └── ui/                # Shared UI components
```

## Getting Started

### Prerequisites

- Node.js (v22.15.0)
- pnpm (v10.10.0)
- Docker and Docker Compose

### Environment Setup

1. Clone the repository and go to the project folder.

2. Install dependencies:
   ```
   pnpm install
   ```
3. If you see a warning about ignored build scripts:
   ```
   pnpm approve-builds
   ```
   Approve all.

4. Set up environment files:
   ```
   pnpm run setup:env
   ```

   This will create the necessary .env files. You can then customize them with
   your specific configuration:

   For Project root folder (.env in ./):
   ```
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=files_manager

   PGADMIN_DEFAULT_EMAIL=admin@example.com
   PGADMIN_DEFAULT_PASSWORD=admin

   MINIO_ROOT_USER=minioadmin
   MINIO_ROOT_PASSWORD=minioadmin
   ```

   For API service (.env in apps/api):
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/files_manager"

   FASTIFY_HOST="0.0.0.0"
   FASTIFY_PORT=8000
   FASTIFY_LOGGER=true

   S3_ENDPOINT="http://localhost:9000"
   S3_ACCESS_KEY="minioadmin"
   S3_SECRET_KEY="minioadmin"
   S3_BUCKET="files"

   KAFKA_BROKER="localhost:9092"
   ```

5. Start the development environment:
   ```
   docker compose up -d
   ```
   Postgres, Kafka, MinIO, and other services
6. Create minio `files` bucket:

   To do this, you need to use your browser and type http://localhost:9001/ (by
   default) to run the Minio web console. You need to name it `files`.

7. Run prisma generator:
   ```
   cd apps/api
   pnpx prisma generate
   ```
8. Run database migrations:
   ```
   cd apps/api
   pnpx prisma migrate dev
   ```
9. Start the development servers. Do it from the project root directory:
   ```
   # Start both API and web servers:
   pnpm run dev

   # Or start them individually:
   pnpm run dev:api    # Start API server
   pnpm run dev:web    # Start web server
   ```

   If you encounter errors with the command `pnpm run dev`, then try to re-run
   it or run `pnpm run build` before.

## Development

### Available Scripts

- `pnpm run dev` - Run all development servers in parallel
- `pnpm run dev:api` - Run only the API server
- `pnpm run dev:web` - Run only the web server
- `pnpm run build` - Build all packages and applications
- `pnpm run start` - Run production applications after the build process
- `pnpm run lint` - Run linting checks
- `pnpm run lint:fix` - Fix linting issues

### API Development

The API is built using Fastify with tRPC for type-safe API endpoints. The main
components are:

- **jobs/**: Contains scheduler tasks
- **lib/**: Utility libraries for database, S3, and Kafka connections
- **routers/**: Contains all tRPC router definitions
- **services/**: Large business or service logic
- **context.ts**: tRPC context creation
- **index.ts**: Entry point to the back-end
- **server.ts**: Server configuration
- **trpc.ts**: tRPC procedure definitions
