#!/usr/bin/env node

// Script to start Deepify with external access
const { spawn } = require('child_process');
const os = require('os');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
console.log(`🎵 Starting Deepify Music Player...`);
console.log(`📱 Local access: http://localhost:5000`);
console.log(`🌍 Network access: http://${localIP}:5000`);
console.log(`⚡ VS Code port forwarding: Use port 5000`);
console.log(`🔒 Make sure your firewall allows port 5000`);
console.log('');

// Start the development server
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});