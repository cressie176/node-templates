import { createInterface } from 'node:readline/promises';

// Detect if stdin is a TTY (interactive) or a pipe (non-interactive)
const isInteractive = process.stdin.isTTY;

// Shared readline interface and iterator for non-interactive mode
let sharedRl = null;
let sharedIterator = null;

export async function prompt(question, defaultValue) {
  if (isInteractive) {
    // Interactive mode: use existing behavior
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const suffix = defaultValue ? ` (${defaultValue})` : '';
    const answer = await rl.question(`${question}${suffix}: `);
    rl.close();

    return answer.trim() || defaultValue;
  } else {
    // Non-interactive mode: read from stdin line by line
    if (!sharedRl) {
      sharedRl = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });
      sharedIterator = sharedRl[Symbol.asyncIterator]();
    }

    // Read next line from stdin
    const { value, done } = await sharedIterator.next();

    if (done || value === undefined) {
      // If no more input, use default value
      return defaultValue;
    }

    const answer = value.trim();
    return answer || defaultValue;
  }
}
