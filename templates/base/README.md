# {{SERVICE_NAME}}

{{SERVICE_DESCRIPTION}}

## Features

- **Node.js + TypeScript** - Modern ES modules with strict TypeScript configuration
- **Hono Web Framework** - Fast, lightweight web server with type safety
- **Structured Logging** - LogTape integration with multiple formatters (JSON, ANSI, pretty)
- **Configuration Management** - JSON-based config with environment-specific overrides
- **Error Handling** - Comprehensive HTTP error classes with middleware
- **Lifecycle Management** - Graceful startup/shutdown with signal handling
- **Testing** - Node.js test runner with integration test support
- **Code Quality** - Biome for linting and formatting
- **Git Hooks** - Lefthook for pre-commit linting and testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`.

### Testing

Run all tests:

```bash
npm test
```

Run specific tests:

```bash
npm run test:match <pattern>
```

### Building

Build for production:

```bash
npm run build
```

### Linting

Check code quality:

```bash
npm run lint
```

Auto-fix issues:

```bash
npm run lint:fix
```

## Project Structure

```
.
├── config/                 # Configuration files
│   ├── default.json       # Default configuration
│   ├── local.json         # Local overrides (gitignored)
│   └── test.json          # Test environment config
├── src/
│   ├── domain/            # Domain models and business logic
│   ├── errors/            # Error classes
│   ├── infra/             # Infrastructure (Application, WebServer, Logger, etc.)
│   ├── init/              # Initialization routines
│   ├── middleware/        # HTTP middleware
│   ├── routes/            # HTTP route handlers
│   └── services/          # Service layer
├── test/                  # Test files
├── test-src/              # Test utilities
├── index.ts               # Application entry point
└── package.json
```

## Configuration

Configuration is loaded from JSON files in the `config/` directory:

1. `default.json` - Base configuration
2. `${APP_ENV}.json` - Environment-specific (e.g., `local.json`, `production.json`)
3. `secrets.json` - Secrets (gitignored)
4. `runtime.json` - Runtime overrides (gitignored)

Set the `APP_ENV` environment variable to switch environments (defaults to `local`).

## API Endpoints

### Health Check

```
GET /__/health
```

Returns service health status.

**Response:**
```json
{
  "message": "OK"
}
```

## Error Handling

The template includes common HTTP error classes:

- `ApplicationError` (500) - Base error class
- `BadRequestError` (400) - Invalid request
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Resource conflict
- `ServiceUnavailableError` (503) - Service unavailable

All errors are automatically caught and formatted by the error handler middleware.

## License

{{LICENSE}}
