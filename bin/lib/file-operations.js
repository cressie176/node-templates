import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function copyDirectory(src, dest, values, skipPaths = []) {
  await mkdir(dest, { recursive: true });

  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.template-meta')) continue;

    const srcPath = join(src, entry.name);
    // Rename 'gitignore' to '.gitignore' during copy (npm excludes .gitignore from packages)
    const destName = entry.name === 'gitignore' ? '.gitignore' : entry.name;
    const destPath = join(dest, destName);
    const relativePath = srcPath.substring(src.length + 1);

    // Check if this path should be skipped
    if (skipPaths.some(skip => relativePath.startsWith(skip))) continue;

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, values, skipPaths);
    } else {
      await copyFileWithReplacements(srcPath, destPath, values);
    }
  }
}

export async function copyFileWithReplacements(src, dest, values) {
  const stats = await stat(src);
  let content = await readFile(src, 'utf8');

  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{{${key}}}`;
    content = content.replaceAll(placeholder, value);
  }

  await writeFile(dest, content, { mode: stats.mode });
}

export function deepMerge(target, source) {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export async function mergeJsonFiles(targetPath, sourcePath, values) {
  const targetContent = await readFile(targetPath, 'utf8');
  let sourceContent = await readFile(sourcePath, 'utf8');

  // Replace placeholders BEFORE parsing
  sourceContent = sourceContent.replaceAll(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });

  const targetJson = JSON.parse(targetContent);
  const sourceJson = JSON.parse(sourceContent);

  const merged = deepMerge(targetJson, sourceJson);
  await writeFile(targetPath, JSON.stringify(merged, null, 2) + '\n');
}

export async function mergeYamlFiles(targetPath, sourcePath) {
  const targetContent = await readFile(targetPath, 'utf8');
  const sourceContent = await readFile(sourcePath, 'utf8');

  await writeFile(targetPath, targetContent + '\n' + sourceContent);
}
