#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prompt } from './lib/prompt.js';
import { copyDirectory, mergeJsonFiles, mergeYamlFiles } from './lib/file-operations.js';
import { runCommand } from './lib/command-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = resolve(__dirname, '../templates');

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

async function checkBaseService() {
  const requiredFiles = ['package.json', 'src', 'config'];

  for (const file of requiredFiles) {
    try {
      await access(file);
    } catch {
      console.error(`\n❌ Error: This command must be run from a base service directory`);
      console.error(`Missing: ${file}`);
      console.error(`\nPlease cd into your service directory first, or create a base service with:`);
      console.error(`  npx github:cressie176/node-templates\n`);
      process.exit(1);
    }
  }
}

async function readExistingPackageJson() {
  try {
    const content = await readFile('package.json', 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`\n❌ Error reading package.json: ${error.message}`);
    process.exit(1);
  }
}

async function gatherValues(packageJson) {
  console.log('\nPostgreSQL configuration:\n');

  const values = {};

  // Get service name from existing package.json
  values.SERVICE_NAME = packageJson.name || 'my-service';

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
  - docker/docker-compose.yml (merged)

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
  console.log('🔧 Add PostgreSQL Layer to Base Service\n');

  await checkBaseService();

  const packageJson = await readExistingPackageJson();
  console.log(`\n📦 Adding PostgreSQL layer to: ${packageJson.name}`);

  const values = await gatherValues(packageJson);
  const targetDir = process.cwd();

  try {
    console.log('\n📦 Adding node-pg template files');
    const pgPath = join(TEMPLATES_DIR, 'node-pg');
    await copyDirectory(pgPath, targetDir, values);

    console.log('📦 Merging package.json dependencies');
    const packageJsonPath = join(targetDir, 'package.json');
    const layerPackageJsonPath = join(pgPath, 'package.json');
    try {
      await access(layerPackageJsonPath);
      await mergeJsonFiles(packageJsonPath, layerPackageJsonPath, values);
    } catch {}

    console.log('📦 Merging configuration files');
    for (const configFile of ['default.json', 'local.json', 'test.json']) {
      const targetConfigPath = join(targetDir, 'config', configFile);
      const sourceConfigPath = join(pgPath, 'config', configFile);
      try {
        await access(sourceConfigPath);
        await mergeJsonFiles(targetConfigPath, sourceConfigPath, values);
      } catch {}
    }

    console.log('📦 Merging docker-compose.yml');
    const targetDockerCompose = join(targetDir, 'docker', 'docker-compose.yml');
    const sourceDockerCompose = join(pgPath, 'docker', 'docker-compose.node-pg.yml');
    try {
      await access(sourceDockerCompose);
      await mergeYamlFiles(targetDockerCompose, sourceDockerCompose);
    } catch {}

    console.log('\n✅ PostgreSQL layer added successfully\n');

    console.log('📦 Installing new dependencies...');
    await runCommand('npm', ['install'], targetDir);

    outputWiringInstructions();

    console.log(`\n✨ PostgreSQL layer added!

Next steps:
  1. Follow the wiring instructions above
  2. Start postgres: docker compose up -d postgres
  3. Run migrations: npm run db:migrate
  4. Update your code to use the Postgres infrastructure

Happy coding! 🎉
`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
