const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Community Fee Management System...');
console.log('Working directory:', process.cwd());

// Start the Next.js development server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
});

console.log('Server starting... Please wait...');
console.log('Open http://localhost:3000 in your browser');
console.log('Admin panel: http://localhost:3000/admin');
console.log('Login: admin@hambriangLory.com / Admin@2025');
