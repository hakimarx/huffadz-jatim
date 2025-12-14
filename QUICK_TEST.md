# 🎯 Quick Testing Reference Card

## 🚀 Start Testing

```bash
# 1. Start the app
npm run dev

# 2. Open browser
http://localhost:3000
```

## 🔑 Test Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin Provinsi** | admin.provinsi@lptq.jatimprov.go.id | admin123 | All data |
| **Admin Kab/Ko** | admin.surabaya@lptq.jatimprov.go.id | admin123 | Surabaya only |
| **Hafiz** | hafiz@example.com | admin123 | Own data only |

## ✅ Quick Test Checklist

### Admin Provinsi (5 min)
- [ ] Login ✓
- [ ] View dashboard stats
- [ ] Open "Data Hafiz" menu
- [ ] Add 1 new Hafiz
- [ ] View "Laporan Harian"
- [ ] Logout ✓

### Admin Kab/Ko (5 min)
- [ ] Login ✓
- [ ] Verify only Surabaya data visible
- [ ] Add 1 Hafiz for Surabaya
- [ ] Try add Hafiz for other region (should fail)
- [ ] View laporan (Surabaya only)
- [ ] Logout ✓

### Hafiz (5 min)
- [ ] Login ✓
- [ ] View profile
- [ ] Create 1 daily report
- [ ] Upload photo (optional)
- [ ] Verify cannot see other Hafiz
- [ ] Logout ✓

## 🐛 Common Issues to Check

- [ ] Login redirect works?
- [ ] RLS working? (users see only their data)
- [ ] Forms validation working?
- [ ] Error messages clear?
- [ ] Logout clears session?

## 📊 Expected Results

### Admin Provinsi
✅ Can see ALL Huffadz from all regions
✅ Can add/edit/delete any Hafiz
✅ Can approve/reject all reports
✅ Can import Excel for any region

### Admin Kab/Ko (Surabaya)
✅ Can see ONLY Surabaya Huffadz
✅ Can add Hafiz for Surabaya
❌ CANNOT see other regions
❌ CANNOT add Hafiz for other regions
✅ Can approve reports from Surabaya only

### Hafiz
✅ Can see own profile
✅ Can create daily reports
✅ Can edit pending reports
❌ CANNOT see other Hafiz data
❌ CANNOT approve own reports
❌ CANNOT access admin features

## 🎬 Test Data Examples

### Sample Hafiz Data
```
NIK: 3578010101990001
Nama: Test Hafiz Surabaya
Tempat Lahir: Surabaya
Tanggal Lahir: 01/01/1990
Jenis Kelamin: L
Alamat: Jl. Test No. 123
Kabupaten/Kota: Kota Surabaya
Tahun Tes: 2024
```

### Sample Daily Report
```
Tanggal: Today
Jenis Kegiatan: Mengajar
Deskripsi: Mengajar tahfidz di Masjid Al-Ikhlas, 30 santri
Lokasi: Surabaya
Durasi: 120 menit
```

## 📞 Need Help?

- Check `PANDUAN_TESTING.md` for detailed steps
- Check `database/setup_demo_users.sql` for user setup
- Check browser console (F12) for errors
- Check terminal for server errors

---

**Total Testing Time:** ~15-20 minutes
**Status:** Ready to test ✅
