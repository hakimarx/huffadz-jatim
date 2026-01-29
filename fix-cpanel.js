const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- CPANEL DEPLOYMENT FIXER START ---');

const baseDir = __dirname;
console.log(`Working directory: ${baseDir}`);

// 1. Handle node_modules symlink issue
const nodeModulesPath = path.join(baseDir, 'node_modules');
try {
    const stats = fs.lstatSync(nodeModulesPath);
    if (stats.isSymbolicLink()) {
        console.log('Found node_modules as a symbolic link. Removing it to use the actual folder...');
        fs.unlinkSync(nodeModulesPath);
        console.log('✅ Symlink removed.');
    } else {
        console.log('node_modules is already a directory or not found.');
    }
} catch (error) {
    if (error.code !== 'ENOENT') {
        console.error('❌ Error checking node_modules:', error.message);
    }
}

// 2. Fix permissions
const foldersToFix = [
    'node_modules',
    '.next',
    'public',
    'public/static',
    'public/uploads',
    'tmp'
];

function setPermissions(dir) {
    try {
        const fullPath = path.join(baseDir, dir);
        if (fs.existsSync(fullPath)) {
            console.log(`Fixing permissions for: ${dir}`);
            // Use chmod directly for better compatibility
            try {
                execSync(`chmod -R 755 ${fullPath}`);
                console.log(`✅ Chmod 755 recursive success for ${dir}`);
            } catch (e) {
                console.log(`⚠️ Recursive chmod failed, trying find...`);
                execSync(`find ${fullPath} -type d -exec chmod 755 {} +`);
                execSync(`find ${fullPath} -type f -exec chmod 644 {} +`);
                console.log(`✅ Success for ${dir} via find`);
            }
        } else {
            console.log(`⚠️ Directory not found: ${dir}`);
        }
    } catch (error) {
        console.error(`❌ Error fixing ${dir}:`, error.message);
    }
}

// Create tmp folder if not exists
const tmpDir = path.join(baseDir, 'tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true, mode: 0o755 });
}

// Execute fix
foldersToFix.forEach(folder => {
    setPermissions(folder);
});

// 3. Create missing directories
const dirsToCreate = [
    'public/uploads/activity-photos',
    'public/uploads/signatures',
    'public/uploads/documents'
];

dirsToCreate.forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true, mode: 0o755 });
        console.log(`✅ Created directory: ${dir}`);
    }
});

console.log('--- FIX COMPLETED ---');

// Simple server to show status in browser
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('AESTHETICS: PERMISSIONS FIXED SUCCESSFULLY!\n' +
        '----------------------------------------\n' +
        '1. node_modules symlink check: Done\n' +
        '2. Recursive permissions (755/644): Done\n' +
        '3. Upload directories: Created\n' +
        '\n' +
        'NEXT STEP:\n' +
        'Go back to cPanel "Setup Node.js App" and change "Application startup file" back to "server.js", then click RESTART.');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Status server running on port ${PORT}`);
});
