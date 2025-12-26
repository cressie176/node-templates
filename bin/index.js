#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prompt } from './lib/prompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function selectTemplate() {
  console.log('🚀 Node.js Service Templates\n');
  console.log('Available options:\n');
  console.log('  1. Create base service - Simple Node.js/TypeScript service with Hono');
  console.log('  2. Add node-pg layer - Add node-pg to an existing base service\n');

  const selection = await prompt('Select option', '1');
  const choice = Number.parseInt(selection, 10);

  if (choice < 1 || choice > 2) {
    console.error('Invalid selection');
    process.exit(1);
  }

  return choice === 1 ? 'base' : 'pg';
}

async function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = join(__dirname, scriptName);
    const proc = spawn(process.execPath, [scriptPath], {
      stdio: 'inherit',
      shell: false,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script failed with exit code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function main() {
  try {
    const template = await selectTemplate();

    const scriptName = template === 'base'
      ? 'create-base-service.js'
      : 'add-node-pg-layer.js';

    await runScript(scriptName);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
