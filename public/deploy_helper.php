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

// DEFINISI PATH
// Sesuaikan path ini dengan struktur folder hosting Anda
$app_root = __DIR__ . '/../huffadz-jatim'; // Path ke folder aplikasi Node.js
$zip_file = $app_root . '/deployment.zip';

echo "<pre>";
echo "🚀 <strong>Starting Deployment Process</strong>\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n";
echo "App Root: $app_root\n";

// 1. Cek File ZIP
if (!file_exists($zip_file)) {
    die("❌ Error: File deployment.zip tidak ditemukan di $zip_file.\nPastikan GitHub Action berhasil upload ke folder yang benar.\n");
}

// 2. Extract ZIP
$zip = new ZipArchive;
if ($zip->open($zip_file) === TRUE) {
    echo "📦 Extracting file...\n";
    $zip->extractTo($app_root);
    $zip->close();
    echo "✅ Extraction success.\n";

    // Hapus file zip
    unlink($zip_file);
} else {
    die("❌ Failed to open ZIP file.\n");
}

// 3. Fix Permissions (PENTING untuk cPanel)
echo "🔧 Fixing permissions...\n";
function recursiveChmod($path, $filePerm = 0644, $dirPerm = 0755)
{
    if (!file_exists($path)) return;
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

// Fix critical folders
$folders_to_fix = [
    $app_root . '/node_modules',
    $app_root . '/.next',
    $app_root . '/public'
];

foreach ($folders_to_fix as $folder) {
    if (file_exists($folder)) {
        recursiveChmod($folder);
        echo "   - Fixed: " . basename($folder) . "\n";
    }
}

// 4. Restart Application (Touch restart.txt)
$restart_dir = $app_root . '/tmp';
$restart_file = $restart_dir . '/restart.txt';

if (!is_dir($restart_dir)) {
    mkdir($restart_dir, 0755, true);
}

if (touch($restart_file)) {
    echo "🔄 App Restart Triggered (touched tmp/restart.txt)\n";
} else {
    echo "⚠️ Failed to trigger restart. Please restart manually via cPanel.\n";
}

echo "\n✨ DEPLOYMENT COMPLETED! ✨";
echo "</pre>";
