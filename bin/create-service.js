#!/usr/bin/env node

import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = resolve(__dirname, '../templates');

const PLACEHOLDERS = {
  SERVICE_NAME: 'Service name (package name)',
  SERVICE_DESCRIPTION: 'Service description',
  AUTHOR: 'Author name',
  LICENSE: 'License',
  SERVER_PORT: 'Server port',
  NODE_VERSION: 'Node.js version requirement',
};

async function prompt(question, defaultValue) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = await rl.question(`${question}${suffix}: `);
  rl.close();

  return answer.trim() || defaultValue;
}

async function selectTemplate() {
  const templates = await readdir(TEMPLATES_DIR);

  if (templates.length === 1) {
    console.log(`Using template: ${templates[0]}`);
    return templates[0];
  }

  console.log('\nAvailable templates:');
  templates.forEach((template, index) => {
    console.log(`  ${index + 1}. ${template}`);
  });

  const selection = await prompt('\nSelect template', '1');
  const index = Number.parseInt(selection, 10) - 1;

  if (index < 0 || index >= templates.length) {
    console.error('Invalid selection');
    process.exit(1);
  }

  return templates[index];
}

async function gatherValues() {
  console.log('\nEnter values for template placeholders:\n');

  const values = {};

  values.SERVICE_NAME = await prompt(PLACEHOLDERS.SERVICE_NAME, 'my-service');
  values.SERVICE_DESCRIPTION = await prompt(PLACEHOLDERS.SERVICE_DESCRIPTION, 'A Node.js service');
  values.AUTHOR = await prompt(PLACEHOLDERS.AUTHOR, process.env.USER || 'Unknown');
  values.LICENSE = await prompt(PLACEHOLDERS.LICENSE, 'ISC');
  values.SERVER_PORT = await prompt(PLACEHOLDERS.SERVER_PORT, '3000');
  values.NODE_VERSION = await prompt(PLACEHOLDERS.NODE_VERSION, '>=22.0.0');

  // Calculate test port as main port + 1
  values.SERVER_PORT_TEST = String(Number.parseInt(values.SERVER_PORT, 10) + 1);

  return values;
}

async function copyDirectory(src, dest, values) {
  await mkdir(dest, { recursive: true });

  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, values);
    } else {
      await copyFileWithReplacements(srcPath, destPath, values);
    }
  }
}

async function copyFileWithReplacements(src, dest, values) {
  const stats = await stat(src);
  let content = await readFile(src, 'utf8');

  // Replace placeholders
  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{{${key}}}`;
    content = content.replaceAll(placeholder, value);
  }

  await writeFile(dest, content, { mode: stats.mode });
}

async function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function main() {
  console.log('🚀 Create Node.js Service\n');

  const template = await selectTemplate();
  const values = await gatherValues();

  const targetDir = resolve(process.cwd(), values.SERVICE_NAME);

  console.log(`\n📁 Creating service in: ${targetDir}`);

  try {
    const templatePath = join(TEMPLATES_DIR, template);
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
