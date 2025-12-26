#!/usr/bin/env node

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prompt } from './lib/prompt.js';
import { copyDirectory } from './lib/file-operations.js';
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
  values.NODE_VERSION = await prompt(BASE_PLACEHOLDERS.NODE_VERSION, '>=22.0.0');

  return values;
}

async function main() {
  console.log('🚀 Create Base Node.js Service\n');

  const values = await gatherValues();
  const targetDirInput = await prompt('Target directory', '.');
  const targetDir = resolve(process.cwd(), targetDirInput);

  console.log(`\n📁 Creating service in: ${targetDir}`);

  try {
    const templatePath = join(TEMPLATES_DIR, 'base');
    await copyDirectory(templatePath, targetDir, values);

    console.log('✅ Template copied successfully\n');

    console.log('📦 Installing dependencies...');
    await runCommand('npm', ['install'], targetDir);

    console.log('\n🔧 Initializing git...');
    await runCommand('git', ['init'], targetDir);

    console.log('🪝 Installing git hooks...');
    await runCommand('npx', ['lefthook', 'install'], targetDir);

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
