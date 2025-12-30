# {{SERVICE_NAME}}

{{SERVICE_DESCRIPTION}}

## Features

- **Node.js + TypeScript** - Modern ES modules with strict TypeScript configuration
- **Hono Web Framework** - Fast, lightweight web server with type safety
- **Structured Logging** - LogTape integration with multiple formatters (JSON, ANSI, pretty)
- **Configuration Management** - JSON-based config with environment-specific overrides
- **Error Handling** - Application error framework with HTTP mapping middleware
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

The server will start on `http://localhost:{{SERVER_PORT}}`.

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
2. `local.json` - Local development overrides
3. `${APP_ENV}.json` - Environment-specific (e.g., `production.json`, `staging.json`)
4. `secrets.json` - Secrets (gitignored)
5. `runtime.json` - Runtime overrides (gitignored)

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

The template provides a clean separation between application errors and HTTP responses:

- `ApplicationError` - Base error class with `code` and `cause` properties
- `HealthCheckError` (503) - Health check failure error

The `ErrorHandler` middleware catches all errors and maps error codes to HTTP status codes. Application code throws `ApplicationError` instances, and the ErrorHandler translates them to appropriate HTTP responses.

Internal server errors (500) have their messages masked to "Internal Server Error" to avoid leaking infrastructure details. All errors are logged with full details.

To add custom errors, extend `ApplicationError` and add the mapping in `ErrorHandler`.

## License

{{LICENSE}}
