const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'landing', port: 3000, dir: 'landing' },
  { name: 'admin', port: 3001, dir: 'admin' },
  { name: 'director', port: 3002, dir: 'director' },
  { name: 'teacher', port: 3003, dir: 'teacher' },
];

const colors = {
  landing: '\x1b[36m',  // cyan
  admin: '\x1b[32m',    // green
  director: '\x1b[35m', // magenta
  teacher: '\x1b[33m',  // yellow
  reset: '\x1b[0m',
};

console.log('\x1b[1m🚀 Barcha loyihalar ishga tushirilmoqda...\x1b[0m\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const processes = [];

services.forEach(({ name, port, dir }) => {
  const cwd = path.resolve(__dirname, dir);
  const color = colors[name] || '';
  const prefix = `${color}[${name}]${colors.reset} `;

  const child = spawn(npmCmd, ['run', 'dev'], {
    cwd,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(prefix + data.toString().replace(/\n(?!$)/g, '\n' + prefix));
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(prefix + data.toString().replace(/\n(?!$)/g, '\n' + prefix));
  });

  child.on('close', (code) => {
    console.log(`${prefix}To'xtatildi (kod: ${code})`);
  });

  processes.push(child);
});

function cleanup() {
  console.log('\n\x1b[31mBarcha jarayonlar to\'xtatilmoqda...\x1b[0m');
  processes.forEach((p) => {
    try {
      if (isWin) {
        spawn('taskkill', ['/pid', p.pid, '/f', '/t']);
      } else {
        p.kill('SIGINT');
      }
    } catch (e) {}
  });
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
