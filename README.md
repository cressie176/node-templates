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

### PostgreSQL Template (`templates/pg/`)

_(Coming soon)_ Extends the base template with PostgreSQL support, including connection pooling, migrations, and database lifecycle management.

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
echo -e "my-service\nMy Service\nAuthor\nMIT\n3000\n3001\n>=22.0.0\n." | node bin/create-base-service.js

# Add PostgreSQL layer (11 values: directory, host, port, test port, db name, user, password, min, max, idle timeout, connection timeout)
echo -e ".\nlocalhost\n5432\n5433\nmydb\nmyuser\npassword\n1\n10\n30000\n2000" | node bin/add-node-pg-layer.js
```

### Manual Installation

1. Copy the template directory to your project location:
   ```bash
   cp -r templates/base/ /path/to/your/project
   cd /path/to/your/project
   ```

2. Replace placeholders in the files:
   - `{{SERVICE_NAME}}` - Your service name
   - `{{SERVICE_DESCRIPTION}}` - Brief description
   - `{{AUTHOR}}` - Your name
   - `{{LICENSE}}` - License type

3. Install dependencies:
   ```bash
   npm install
   ```

4. Initialize git:
   ```bash
   git init
   lefthook install
   ```

5. Start development:
   ```bash
   npm run dev
   ```

## Template Placeholders

The following placeholders should be replaced when creating a new project:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{SERVICE_NAME}}` | Service/package name | `my-api-service` |
| `{{SERVICE_DESCRIPTION}}` | Brief description | `REST API for user management` |
| `{{AUTHOR}}` | Author name | `John Smith` |
| `{{LICENSE}}` | License type | `MIT` |

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
