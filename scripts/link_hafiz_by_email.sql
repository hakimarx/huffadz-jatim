-- Script helper: perbarui user_id pada tabel hafiz berdasarkan email sama
-- Pastikan menjalankan pada environment yang tepat (staging/dev) dan backup DB terlebih dahulu

UPDATE hafiz h
JOIN users u ON u.email = h.email
SET h.user_id = u.id
WHERE (h.user_id IS NULL OR h.user_id = 0);

-- Jika hanya ingin memeriksa yang belum tertaut tanpa melakukan update
-- SELECT h.id, h.nik, h.nama, h.email, u.id as user_id, u.email as user_email FROM hafiz h LEFT JOIN users u ON u.email = h.email WHERE h.user_id IS NULL OR h.user_id = 0;