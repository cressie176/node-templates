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

### Via npx (Coming Soon)

```bash
npx cressie176/create-pg-service my-service
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

## Contributing

Contributions are welcome! Please ensure templates remain:

- **General purpose** - No domain-specific logic
- **Well documented** - Clear README and code comments where needed
- **Tested** - Include test coverage for infrastructure code
- **Consistent** - Follow existing patterns and structure

## License

ISC
# node-templates
