#!/usr/bin/env node

/**
 * Setup Tunnel untuk Public Access
 * Gunakan salah satu dari berikut:
 * 
 * Option 1: Cloudflare Tunnel (Recommended - No auth needed)
 * Option 2: LocalTunnel (Simple - Just run it)
 * Option 3: Ngrok (Best - Needs auth token)
 */

const { spawn } = require('child_process');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════╗
║   PUBLIC TUNNEL SETUP - Huffadz Jatim                     ║
╚════════════════════════════════════════════════════════════╝

Pilih opsi untuk public access:

1️⃣  CLOUDFLARE TUNNEL (Recommended - No auth needed)
   npm install -g @cloudflare/wrangler
   wrangler tunnel

2️⃣  LOCALTUNNEL (Simplest - Just run)
   npm install -g localtunnel
   lt --port 3000

3️⃣  NGROK (Best performance - Needs auth)
   Setup token terlebih dahulu:
   https://dashboard.ngrok.com/get-started/your-authtoken
   
   Kemudian jalankan:
   ngrok http 3000

4️⃣  EXPOSER (Alternative Simple)
   npm install -g exposer
   exposer 3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 TESTING LOCALLY (Without Tunnel):
   http://localhost:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Detect yang tersedia
console.log('\n🔍 Detecting available tunneling tools...\n');

const tools = [
    { name: 'localtunnel', cmd: 'lt', isAvailable: false },
    { name: 'ngrok', cmd: 'ngrok', isAvailable: false },
    { name: 'wrangler', cmd: 'wrangler', isAvailable: false }
];

// Check which tools are available
const checkCommand = (cmd) => {
    return new Promise((resolve) => {
        const proc = spawn('where', [cmd], { stdio: 'pipe', shell: true });
        let hasOutput = false;
        proc.stdout.on('data', () => { hasOutput = true; });
        proc.on('close', (code) => resolve(hasOutput || code === 0));
    });
};

(async () => {
    for (const tool of tools) {
        tool.isAvailable = await checkCommand(tool.cmd);
    }

    const available = tools.filter(t => t.isAvailable);
    
    if (available.length === 0) {
        console.log('❌ No tunneling tool found.\n');
        console.log('📦 Install one of these:');
        console.log('   npm install -g localtunnel');
        console.log('   npm install -g ngrok');
        console.log('\n   Or access locally: http://localhost:3000\n');
        return;
    }

    console.log('✅ Available tools:');
    available.forEach((tool, i) => {
        console.log(`   ${i + 1}. ${tool.name}`);
    });

    console.log('\n💡 Tip: LocalTunnel is easiest to start with\n');
})();
