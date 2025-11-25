**Kit Test Task**

A small NestJS-based backend application used for the kit test task. It includes authentication, projects and tasks modules, and is prepared to run locally or in Docker. This repository is intended as a demonstration of a simple REST API built with NestJS.

**Quick Overview**

- **Purpose**: Provide a compact, well-structured backend demonstrating authentication, project and task management, and tests.
- **Stack**: Node.js, TypeScript, NestJS, (Mongoose / MongoDB), Docker (Docker Compose).

**Repository Structure**

- **`src/`**: Application source code.
- **`src/auth`**: Authentication module, controllers, DTOs, and JWT strategy.
- **`src/projects`**: Projects module, controllers, DTOs and schema.
- **`src/tasks`**: Tasks module, controllers, DTOs and schema.
- **`src/users`**: User-related services and schema.
- **`test/`**: End-to-end test files.

**Prerequisites**

- **Node.js** v16+ and **npm** installed.
- **Docker** and **Docker Compose** (optional, for running with containers).

**Environment Variables (Detailed)**
Create a `.env` file in the project root or provide environment variables via your container/orchestration. The application reads configuration through `@nestjs/config` and expects the following variables (the repository contains a working `.env` example):

- **`PORT`**: Port the NestJS app listens on. Example: `3000`. Default used in code: `3000` when not set.
- **`JWT_SECRET`**: Secret key used to sign and verify JWT tokens. Example: `your_jwt_secret_key`. Keep this value secret in production.
- **`JWT_EXPIRES_IN`**: Token lifetime passed to the JWT sign options. Example: `3600` (seconds) or an ISO duration like `1h`. In this project the `.env` contains a very large numeric value; you can use a sensible duration like `3600`.
- **`MONGO_INITDB_ROOT_USERNAME`**: MongoDB initial root username used by the `mongo` service when starting a fresh DB. Example: `root`.
- **`MONGO_INITDB_ROOT_PASSWORD`**: MongoDB initial root password used by the `mongo` service. Example: `rootpassword`.
- **`MONGO_DB_NAME`**: Logical database name used by the application. Example: `task_manager`.
- **`MONGO_HOST`**: Hostname of the MongoDB server. In the Docker setup this is `mongo` (the service name). Locally you may use `localhost`.
- **`MONGO_PORT`**: MongoDB port. Default: `27017`.
- **`MONGO_URI`**: Full connection string used by Mongoose to connect. Example (used in Docker):

  `mongodb://root:rootpassword@mongo:27017/task_manager?authSource=admin`

Notes:

- The application uses `MONGO_URI` directly in `src/app.module.ts` to configure Mongoose.
- `JWT_SECRET` and `JWT_EXPIRES_IN` are consumed by the `JwtModule` and the `JwtStrategy` (see `src/auth`).
- `PORT` is read in `src/main.ts` (`process.env.PORT ?? 3000`).

**Example `.env` file**
Create a `.env` file in the project root with values similar to this (do not commit secrets to source control):

```
PORT=3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=3600

MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=rootpassword
MONGO_DB_NAME=task_manager
MONGO_HOST=mongo
MONGO_PORT=27017

MONGO_URI=mongodb://root:rootpassword@mongo:27017/task_manager?authSource=admin
```

**Docker & `.env` integration**

- The project's `docker-compose.yml` includes an `env_file: .env` entry for the `app` service. That means the `app` container will receive the variables defined in the repository root `.env` file.
- The `mongo` service uses `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` (provided via Compose interpolation) to initialize the database on first run.
- Important: when running with Docker Compose the `MONGO_URI` in `.env` should point to the `mongo` service name (for example `mongodb://root:rootpassword@mongo:27017/task_manager?authSource=admin`), because the app container communicates with the DB container by its Compose network hostname `mongo`.

**Running with Docker Compose**

- Build and start (reads `.env` automatically):

  `docker-compose up --build`

- If you prefer to pass a different env file, use the `--env-file` flag with `docker compose` (modern Docker CLI):

  `docker compose --env-file .env.dev up --build`

- To override a single variable at runtime, prefix the `docker-compose` command on Linux/macOS or set environment vars in your PowerShell session on Windows. Example for PowerShell (temporary override):

  `$env:JWT_SECRET = 'anotherSecret'; docker-compose up --build`

**Security recommendations**

- Never commit the real `.env` with secrets to Git. Use a `.env.example` with safe example values and keep secrets in a vault or CI/CD secret store.
- Use strong `JWT_SECRET` values in production and consider rotating them if needed.

**Install & Run Locally**

- Install dependencies:

  `npm install`

- Start in development mode (hot reload):

  `npm run start:dev`

- Build and run production build:

  `npm run build`
  `npm run start:prod`

**Run with Docker**

- Build and start the application with Docker Compose:

  `docker-compose up --build`

- The repository also includes helper scripts (if present in `package.json`) — for example you may see `npm run docker:restart` to restart the Docker setup used during development.

**Testing**

- Run unit tests:

  `npm run test`

- Run end-to-end tests:

  `npm run test:e2e`

- Run lint (if available):

  `npm run lint`

If tests require a running database, start your MongoDB instance or use the Docker Compose stack before running e2e tests.

**Development Notes**

- API modules are organized under `src/` by feature (`auth`, `projects`, `tasks`, `users`).
- DTOs and Mongoose schemas live alongside their modules under `dto/` and `schemas/` respectively.
- Authentication uses JWT; check `src/auth/strategies/jwt.strategy.ts` and `src/common/guards/jwt-auth.guard.ts`.

**Common Commands**

- Install dependencies: `npm install`
- Start dev server: `npm run start:dev`
- Run tests: `npm run test` and `npm run test:e2e`
- Start with Docker: `docker-compose up --build`

**Contributing**

- Feel free to open issues or pull requests. Keep changes small and focused. Add tests for new features and ensure existing tests pass.

**License & Contact**

- This project does not include a license file by default. Add a `LICENSE` if you intend to make the project open source.
- For questions, check the repository owner or open an issue.

---

If you'd like, I can also:

- add a sample `.env.example` with required variables,
- run the test suite here and fix any small issues found,
- or add a short API usage section showing example requests.
