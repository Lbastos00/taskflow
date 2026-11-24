import { spawn } from 'node:child_process';
const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [spawn(command, ['run', 'api'], { stdio: 'inherit', shell: process.platform === 'win32' }), spawn(command, ['start'], { stdio: 'inherit', shell: process.platform === 'win32' })];
function stop() { for (const child of children) if (child.exitCode === null) child.kill(); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
for (const child of children) child.on('exit', (code) => { if (code && code !== 0) { stop(); process.exitCode = code; } });
