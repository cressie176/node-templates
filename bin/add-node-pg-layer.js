#!/usr/bin/env node

import { access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prompt } from './lib/prompt.js';
import { copyDirectory, mergeJsonFiles, mergeYamlFiles } from './lib/file-operations.js';
import { runCommand } from './lib/command-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = resolve(__dirname, '../templates');

const BASE_PLACEHOLDERS = {
  SERVICE_NAME: 'Service name (package name)',
  SERVICE_DESCRIPTION: 'Service description',
  AUTHOR: 'Author name',
  LICENSE: 'License',
  SERVER_PORT: 'Server port',
  SERVER_PORT_TEST: 'Test server port',
  NODE_VERSION: 'Node.js version requirement',
  LOG_LEVEL: 'Log level',
};

const PG_PLACEHOLDERS = {
  PG_HOST: 'PostgreSQL host',
  PG_PORT: 'PostgreSQL port',
  PG_PORT_TEST: 'Test PostgreSQL port',
  PG_NAME: 'PostgreSQL database name',
  PG_USER: 'PostgreSQL user',
  PG_PASSWORD: 'PostgreSQL password',
  PG_POOL_MIN: 'Min pool connections',
  PG_POOL_MAX: 'Max pool connections',
  PG_IDLE_TIMEOUT: 'Idle timeout (ms)',
  PG_CONNECTION_TIMEOUT: 'Connection timeout (ms)',
};

async function gatherValues() {
  console.log('\nEnter values for template placeholders:\n');

  const values = {};

  values.SERVICE_NAME = await prompt(BASE_PLACEHOLDERS.SERVICE_NAME, 'my-service');
  values.SERVICE_DESCRIPTION = await prompt(BASE_PLACEHOLDERS.SERVICE_DESCRIPTION, 'A Node.js service');
  values.AUTHOR = await prompt(BASE_PLACEHOLDERS.AUTHOR, process.env.USER || 'Unknown');
  values.LICENSE = await prompt(BASE_PLACEHOLDERS.LICENSE, 'ISC');
  values.SERVER_PORT = await prompt(BASE_PLACEHOLDERS.SERVER_PORT, '3000');
  values.SERVER_PORT_TEST = await prompt(BASE_PLACEHOLDERS.SERVER_PORT_TEST, '3001');
  values.LOG_LEVEL = await prompt(BASE_PLACEHOLDERS.LOG_LEVEL, 'info');
  values.NODE_VERSION = await prompt(BASE_PLACEHOLDERS.NODE_VERSION, '>=22.0.0');

  console.log('\nPostgreSQL configuration:\n');
  values.PG_HOST = await prompt(PG_PLACEHOLDERS.PG_HOST, 'localhost');
  values.PG_PORT = await prompt(PG_PLACEHOLDERS.PG_PORT, '5432');
  values.PG_PORT_TEST = await prompt(PG_PLACEHOLDERS.PG_PORT_TEST, '5433');
  values.PG_NAME = await prompt(PG_PLACEHOLDERS.PG_NAME, values.SERVICE_NAME);
  values.PG_USER = await prompt(PG_PLACEHOLDERS.PG_USER, values.SERVICE_NAME);
  values.PG_PASSWORD = await prompt(PG_PLACEHOLDERS.PG_PASSWORD, 'password');
  values.PG_POOL_MIN = await prompt(PG_PLACEHOLDERS.PG_POOL_MIN, '1');
  values.PG_POOL_MAX = await prompt(PG_PLACEHOLDERS.PG_POOL_MAX, '10');
  values.PG_IDLE_TIMEOUT = await prompt(PG_PLACEHOLDERS.PG_IDLE_TIMEOUT, '30000');
  values.PG_CONNECTION_TIMEOUT = await prompt(PG_PLACEHOLDERS.PG_CONNECTION_TIMEOUT, '2000');

  return values;
}

function outputWiringInstructions() {
  console.log(`
📝 Manual wiring required for PostgreSQL:

The following files have been added:
  - src/infra/Postgres.ts
  - src/init/init-migrations.ts
  - src/migrations/001.create-nuke-function.sql
  - test-src/TestPostgres.ts
  - test/infra/Postgres.test.ts
  - docker/Dockerfile.postgres
  - docker/docker-compose.postgres.yml

To complete integration, update these files:

1. src/infra/Application.ts
   - Add: import type Postgres from './Postgres.js';
   - Add postgres to ApplicationConfig, properties, constructor
   - In start(): await this.postgres.start(); (before server)
   - In stop(): await this.postgres.stop(); (after server)

2. src/infra/WebServer.ts
   - Add: import type Postgres from './Postgres.js';
   - Add postgres to WebServerDependencies
   - Pass postgres to createStatusRoutes({ postgres })

3. src/routes/status.ts
   - Add imports for ServiceUnavailableError and Postgres
   - Add postgres parameter
   - Test postgres in health check: await Promise.all([postgres.test()])

4. index.ts
   - Add imports for Postgres and initMigrations
   - After initLogging: await initMigrations(config.postgres);
   - Instantiate: const postgres = new Postgres({ config: config.postgres });
   - Pass to WebServer and Application

See WIRING.md for detailed examples.

Start postgres: docker compose up -d postgres
`);
}

async function main() {
  console.log('🚀 Create Node.js Service with PostgreSQL (extends base)\n');

  const values = await gatherValues();
  const targetDir = resolve(process.cwd(), values.SERVICE_NAME);

  console.log(`\n📁 Creating service in: ${targetDir}`);

  try {
    console.log('📦 Applying base template');
    const basePath = join(TEMPLATES_DIR, 'base');
    await copyDirectory(basePath, targetDir, values);

    console.log('📦 Applying node-pg template layer');
    const pgPath = join(TEMPLATES_DIR, 'node-pg');
    await copyDirectory(pgPath, targetDir, values);

    const packageJsonPath = join(targetDir, 'package.json');
    const layerPackageJsonPath = join(pgPath, 'package.json');
    try {
      await access(layerPackageJsonPath);
      await mergeJsonFiles(packageJsonPath, layerPackageJsonPath, values);
    } catch {}

    for (const configFile of ['default.json', 'local.json', 'test.json']) {
      const targetConfigPath = join(targetDir, 'config', configFile);
      const sourceConfigPath = join(pgPath, 'config', configFile);
      try {
        await access(sourceConfigPath);
        await mergeJsonFiles(targetConfigPath, sourceConfigPath, values);
      } catch {}
    }

    const targetDockerCompose = join(targetDir, 'docker', 'docker-compose.yml');
    const sourceDockerCompose = join(pgPath, 'docker', 'docker-compose.node-pg.yml');
    try {
      await access(sourceDockerCompose);
      await mergeYamlFiles(targetDockerCompose, sourceDockerCompose);
    } catch {}

    console.log('✅ Template copied successfully\n');

    console.log('📦 Installing dependencies...');
    await runCommand('npm', ['install'], targetDir);

    console.log('\n🔧 Initializing git...');
    await runCommand('git', ['init'], targetDir);

    console.log('🪝 Installing git hooks...');
    await runCommand('npx', ['lefthook', 'install'], targetDir);

    outputWiringInstructions();

    console.log(`\n✨ Service created successfully!

Next steps:
  cd ${values.SERVICE_NAME}
  npm run dev

Happy coding! 🎉
`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
