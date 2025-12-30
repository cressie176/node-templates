# Service Templates

A collection of Node.js service templates for rapid project bootstrapping.

## Available Templates

### Base Template (`templates/base/`)

A minimal but complete Node.js + Hono web service template with:

- TypeScript with ES modules
- Hono web framework
- Structured logging (LogTape)
- JSON-based configuration
- Comprehensive error handling
- Lifecycle management
- Testing infrastructure
- Code quality tools (Biome, Lefthook)

**Use when:** You need a lightweight HTTP service without database dependencies.

**Configuration variables:**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SERVICE_NAME` | Service/package name | `my-service` | `my-api-service` |
| `SERVICE_DESCRIPTION` | Brief description | `A Node.js service` | `REST API for user management` |
| `AUTHOR` | Author name | `$USER` | `John Smith` |
| `LICENSE` | License type | `ISC` | `MIT` |
| `SERVER_PORT` | HTTP server port | `3000` | `3000` |
| `SERVER_PORT_TEST` | Test server port | `3001` | `3001` |
| `NODE_VERSION` | Node.js version requirement | `>=22.0.0` | `>=22.0.0` |

### PostgreSQL Template (`templates/node-pg/`)

Extends the base template with PostgreSQL support, including:

- PostgreSQL connection pool (node-postgres)
- Migration system with automatic/manual execution modes
- Database lifecycle management (start/stop/test/nuke)
- Docker Compose setup with custom PostgreSQL image (pg_cron support)
- Test infrastructure with database cleanup utilities
- Health check integration

**Use when:** Your service needs PostgreSQL database support with robust connection pooling and migration management.

**Configuration variables:**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PG_HOST` | PostgreSQL host | `localhost` | `localhost` |
| `PG_PORT` | PostgreSQL port | `5432` | `5432` |
| `PG_PORT_TEST` | Test PostgreSQL port | `5433` | `5433` |
| `PG_NAME` | Database name | `{SERVICE_NAME}` | `my-api-service` |
| `PG_USER` | Database user | `{SERVICE_NAME}` | `my-api-service` |
| `PG_PASSWORD` | Database password | `password` | `password` |
| `PG_POOL_MIN` | Min pool connections | `1` | `1` |
| `PG_POOL_MAX` | Max pool connections | `10` | `10` |
| `PG_IDLE_TIMEOUT` | Idle timeout (ms) | `30000` | `30000` |
| `PG_CONNECTION_TIMEOUT` | Connection timeout (ms) | `2000` | `2000` |

## Using Templates

### Interactive Installation

Create a new service interactively:

```bash
# Clone the repository
git clone https://github.com/cressie176/node-templates.git
cd node-templates

# Create a base service
node bin/create-base-service.js

# Or create with PostgreSQL support
node bin/create-base-service.js
node bin/add-node-pg-layer.js
```

### Non-Interactive Installation

For automated/CI environments, pipe values to stdin:

```bash
# Base service (7 values: service name, description, author, license, port, test port, node version, directory)
echo -e "my-service\nMy Service\nAuthor\nMIT\n3000\n3001\n>=22.0.0\n." | npx cressie176/node-templates create-base-service

# Add PostgreSQL layer (11 values: directory, host, port, test port, db name, user, password, min, max, idle timeout, connection timeout)
echo -e ".\nlocalhost\n5432\n5433\nmydb\nmyuser\npassword\n1\n10\n30000\n2000" | npx cressie176/node-templates add-node-pg-layer
```

## Template Structure

Each template follows a consistent structure:

```
template-name/
├── config/              # Configuration files
├── src/
│   ├── domain/         # Domain models
│   ├── errors/         # Error classes
│   ├── infra/          # Infrastructure (app, server, logger)
│   ├── init/           # Initialization routines
│   ├── middleware/     # HTTP middleware
│   ├── routes/         # HTTP route handlers
│   └── services/       # Service layer
├── test/               # Tests
├── test-src/           # Test utilities
├── scripts/            # Helper scripts
├── index.ts            # Entry point
├── package.json
├── tsconfig.json
├── biome.json
├── lefthook.yml
├── .gitignore
└── README.md
```

## Continuous Integration

The templates are automatically tested on every push via GitHub Actions:

### Test Base Template
- Creates a service from the base template
- Runs Biome linter and TypeScript compiler
- Executes test suite
- Starts service and verifies `/__/health` endpoint responds

### Test Base + Node-PG Template
- Creates a service with PostgreSQL layer
- Builds custom PostgreSQL Docker image (with pg_cron and app.allow_nuke)
- Runs Biome linter and TypeScript compiler
- Executes full test suite with PostgreSQL integration
- Starts service and verifies health endpoint

### Performance Optimizations
- Docker buildx cache for PostgreSQL image builds
- npm node_modules caching for faster dependency installation

This ensures all templates compile correctly, pass linting, and work as expected in a clean environment.

## Contributing

Contributions are welcome! Please ensure templates remain:

- **General purpose** - No domain-specific logic
- **Well documented** - Clear README and code comments where needed
- **Tested** - Include test coverage for infrastructure code
- **Consistent** - Follow existing patterns and structure

## License

ISC
