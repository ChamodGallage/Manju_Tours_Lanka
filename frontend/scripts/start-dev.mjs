import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('\x1b[1m\x1b[32m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');
console.log('\x1b[1m\x1b[32m%s\x1b[0m', '  🌴 Manju Tours Lanka — Starting Dual Development Environment');
console.log('\x1b[1m\x1b[32m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '  👉 Backend API:  http://localhost:5001/api (Health: /api/health)');
console.log('\x1b[35m%s\x1b[0m', '  👉 Frontend App: http://localhost:3000 (Admin: /admin/login)');
console.log('───────────────────────────────────────────────────────────────\n');

function startProcess(name, args, cwd, color) {
  const child = spawn(npmCmd, args, {
    cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  const prefix = `\x1b[${color}m[${name}]\x1b[0m `;

  child.stdout?.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim().length > 0) {
        process.stdout.write(`${prefix}${line}\n`);
      }
    }
  });

  child.stderr?.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim().length > 0) {
        process.stderr.write(`${prefix}${line}\n`);
      }
    }
  });

  child.on('close', (code) => {
    console.log(`${prefix}Process exited with code ${code}`);
  });

  return child;
}

const backendProcess = startProcess('BACKEND', ['run', 'dev'], path.join(rootDir, 'backend'), '36');
const frontendProcess = startProcess('FRONTEND', ['run', 'dev'], path.join(rootDir, 'frontend'), '35');

function shutdown() {
  console.log('\n🛑 Shutting down Manju Tours servers...');
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
