<?php
// Letakkan file ini di public_html atau sejajar dengan folder yang mau dihapus
// Akses via browser: domain.com/killer.php

$target = 'huffadz-jatim1'; // Ganti dengan nama folder yang susah dihapus

function delete_files($target) {
    if(is_dir($target)){
        $files = glob( $target . '*', GLOB_MARK ); //GLOB_MARK adds a slash to directories returned
        
        foreach( $files as $file ){
            delete_files( $file );      
        }
      
        if(rmdir( $target )){
            echo "Directori Terhapus: " . $target . "<br>";
        } else {
            echo "<span style='color:red'>Gagal hapus folder (mungkin permission): " . $target . "</span><br>";
            // Coba ganti permission dulu
            chmod($target, 0777);
            if(rmdir($target)) echo "Berhasil hapus setelah chmod: " . $target . "<br>";
        }
    } elseif(is_file($target)) {
        if(unlink( $target )){
            echo "File Terhapus: " . $target . "<br>";
        } else {
             echo "<span style='color:red'>Gagal hapus file: " . $target . "</span><br>";
        }
    }
}

echo "<h1>Pembersih Folder Bandel</h1>";
if (file_exists($target)) {
    echo "Memulai penghapusan folder: <strong>$target</strong>...<hr>";
    delete_files($target);
    echo "<hr>Selesai. Silakan cek File Manager.";
} else {
    echo "Folder <strong>$target</strong> tidak ditemukan.";
}
?>
