# Integrasi Registrasi Self vs Admin

## Status: In Progress

### 1. Modifikasi fungsi registerUser di lib/auth.ts
- [ ] Tambahkan parameter opsional untuk membuat record hafiz
- [ ] Tambahkan validasi NIK untuk role hafiz
- [ ] Pastikan konsistensi data antara self dan admin registration

### 2. Update API admin registration (app/api/users/route.ts)
- [ ] Terima parameter NIK untuk role hafiz
- [ ] Panggil registerUser dengan parameter hafiz
- [ ] Tambahkan validasi NIK di level API

### 3. Update UI admin (app/dashboard/pengaturan/page.tsx)
- [ ] Tambahkan field NIK untuk role hafiz
- [ ] Update form validation
- [ ] Update form submission

### 4. Testing dan Verifikasi
- [ ] Test registrasi self (tetap berfungsi)
- [ ] Test registrasi admin untuk hafiz (dengan NIK)
- [ ] Test registrasi admin untuk admin (tanpa NIK)
- [ ] Verifikasi data konsisten di database
- [ ] Test pencegahan duplikasi NIK
