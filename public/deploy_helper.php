<?php
// deploy_helper.php - Automatisasi Deploy di cPanel
// Upload file ini ke folder public_html (atau folder web root yang bisa diakses publik)

// KONFIGURASI
$secret_key = $_GET['key'] ?? '';
$expected_key = 'HafizJatimSecureDeploy2026'; // Harus sama dengan secret di GitHub

if ($secret_key !== $expected_key) {
    http_response_code(403);
    die("⛔ Access Denied: Invalid Key");
}

// DEFINISI PATH ABSOLUT
$app_root = '/home/hafizjat/huffadz-jatim';
// Coba deteksi jika script dijalankan di subfolder
if (!is_dir($app_root)) {
    $app_root = realpath(__DIR__ . '/../huffadz-jatim');
}

// Cek file ZIP yang tersedia
$zip_candidates = [
    $app_root . '/huffadz-jatim-production-v2.zip',
    $app_root . '/huffadz-jatim-production.zip',
    $app_root . '/deployment.zip'
];

$zip_file = '';
foreach ($zip_candidates as $candidate) {
    if (file_exists($candidate)) {
        $zip_file = $candidate;
        break;
    }
}

echo "<pre>";
echo "🚀 <strong>Starting Deployment Process</strong>\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n";
echo "App Root: " . ($app_root ?: 'NOT FOUND') . "\n";

if (!$zip_file) {
    die("❌ Error: Tidak ada file ZIP ditemukan di " . implode(', ', $zip_candidates) . "\n");
}
echo "ZIP File: " . basename($zip_file) . "\n";

// 1. MANAJEMEN NODE_MODULES (Sangat Penting di cPanel)
$node_modules = $app_root . '/node_modules';
if (is_link($node_modules)) {
    echo "🔗 Found node_modules as symlink. Removing it...\n";
    unlink($node_modules);
}

// 2. Extract ZIP
$zip = new ZipArchive;
if ($zip->open($zip_file) === TRUE) {
    echo "📦 Extracting file to $app_root...\n";
    if ($zip->extractTo($app_root)) {
        echo "✅ Extraction success.\n";
    } else {
        echo "❌ Extraction failed!\n";
    }
    $zip->close();

    // Opsional: Hapus file zip setelah extract
    // unlink($zip_file);
} else {
    die("❌ Failed to open ZIP file.\n");
}

// 3. Fix Permissions
echo "🔧 Fixing permissions recursively...\n";
function recursiveChmod($path, $filePerm = 0644, $dirPerm = 0755)
{
    if (!file_exists($path)) return;
    if (is_link($path)) return; // Jangan ganggu symlink lain

    if (is_dir($path)) {
        chmod($path, $dirPerm);
        $files = array_diff(scandir($path), array('.', '..'));
        foreach ($files as $file) {
            recursiveChmod($path . DIRECTORY_SEPARATOR . $file, $filePerm, $dirPerm);
        }
    } else {
        chmod($path, $filePerm);
    }
}

// Fix essential folders
$folders_to_fix = ['.next', 'node_modules', 'public', 'tmp'];
foreach ($folders_to_fix as $f) {
    $full = $app_root . '/' . $f;
    if (file_exists($full)) {
        recursiveChmod($full);
        echo "   - Fixed: $f\n";
    }
}

// 4. Create upload folders if missing
$uploads = [
    $app_root . '/public/uploads/activity-photos',
    $app_root . '/public/uploads/signatures',
    $app_root . '/public/uploads/documents'
];
foreach ($uploads as $up) {
    if (!is_dir($up)) {
        mkdir($up, 0755, true);
        echo "   - Created: " . str_replace($app_root, '', $up) . "\n";
    }
}

// 5. Restart Application
$restart_file = $app_root . '/tmp/restart.txt';
if (!is_dir(dirname($restart_file))) mkdir(dirname($restart_file), 0755, true);
if (touch($restart_file)) {
    echo "🔄 App Restart Triggered (touched tmp/restart.txt)\n";
}

echo "\n✨ DEPLOYMENT COMPLETED! ✨\n";
echo "Silakan akses: https://hafizjatim.my.id\n";
echo "</pre>";
