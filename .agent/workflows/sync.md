---
description: Sincronize local changes with GitHub (Pull & Push)
---

This workflow ensures your office PC and home laptop are always in sync.

// turbo-all
1. Menjalankan skrip sinkronisasi otomatis:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/vibe-sync.ps1
```

2. Verifikasi status git:
```powershell
git status
```
