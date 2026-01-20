# 🚀 Panduan Deployment

Panduan deploy aplikasi Huffadz Jawa Timur ke production.

## 📋 Pilihan Deployment

### 1. **Vercel** (Recommended - Paling Mudah)
### 2. **Server Custom** (VPS/Dedicated Server)
### 3. **GitLab Pages** (Static Export)

---

## 🌟 Option 1: Deploy ke Vercel (RECOMMENDED)

Vercel adalah platform terbaik untuk Next.js, gratis untuk personal projects.

### Langkah-Langkah:

#### 1. Push Code ke GitHub

```bash
# Pastikan sudah di folder project
cd huffadz-jatim

# Add remote GitHub (ganti dengan repo Anda)
git remote add origin https://github.com/hakimarx/huffadz-jatim.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

#### 2. Deploy di Vercel

1. Kunjungi [vercel.com](https://vercel.com)
2. Sign up dengan GitHub account
3. Klik **"Add New Project"**
4. Import repository `huffadz-jatim`
5. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### 3. Set Environment Variables

Di Vercel dashboard, tambahkan environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

#### 4. Deploy!

1. Klik **"Deploy"**
2. Tunggu 2-3 menit
3. Aplikasi Anda live di: `https://huffadz-jatim.vercel.app`

#### 5. Custom Domain (Opsional)

Untuk menggunakan domain `lptq.jatimprov.go.id`:

1. Di Vercel dashboard, buka **Settings** > **Domains**
2. Tambahkan domain: `lptq.jatimprov.go.id`
3. Vercel akan memberikan DNS records
4. Update DNS di domain provider Anda:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
5. Tunggu propagasi DNS (5-30 menit)

### Auto-Deploy dari GitHub

Setiap kali Anda push ke GitHub, Vercel otomatis deploy versi terbaru!

```bash
git add .
git commit -m "feat: tambah fitur baru"
git push origin main
# Otomatis deploy! 🚀
```

---

## 🖥️ Option 2: Deploy ke Server Custom (VPS)

Untuk deploy ke server sendiri (lptq.jatimprov.go.id).

### Prasyarat:
- VPS dengan Ubuntu 20.04+ atau CentOS 7+
- Node.js 18+ installed
- Nginx installed
- Domain sudah pointing ke server

### Langkah-Langkah:

#### 1. Setup Server

```bash
# SSH ke server
ssh root@lptq.jatimprov.go.id

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### 2. Clone Repository

```bash
# Clone dari GitHub
cd /var/www
sudo git clone https://github.com/hakimarx/huffadz-jatim.git
cd huffadz-jatim

# Install dependencies
sudo npm install

# Create .env.local
sudo nano .env.local
# Paste environment variables, save (Ctrl+X, Y, Enter)
```

#### 3. Build Production

```bash
# Build aplikasi
sudo npm run build

# Test run
sudo npm start
# Jika berhasil, Ctrl+C untuk stop
```

#### 4. Setup PM2

```bash
# Start dengan PM2
sudo pm2 start npm --name "huffadz-jatim" -- start

# Auto-start on server reboot
sudo pm2 startup
sudo pm2 save

# Check status
sudo pm2 status
```

#### 5. Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/huffadz-jatim
```

Paste konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name lptq.jatimprov.go.id www.lptq.jatimprov.go.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/huffadz-jatim /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 6. Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d lptq.jatimprov.go.id -d www.lptq.jatimprov.go.id

# Auto-renew
sudo certbot renew --dry-run
```

✅ Aplikasi sekarang live di: `https://lptq.jatimprov.go.id`

#### 7. Update Aplikasi

Untuk update aplikasi di server:

```bash
cd /var/www/huffadz-jatim
sudo git pull origin main
sudo npm install
sudo npm run build
sudo pm2 restart huffadz-jatim
```

---

## 🔄 Option 3: Deploy via GitLab

Untuk sync dari GitHub ke GitLab:

### 1. Setup GitLab Repository

```bash
# Add GitLab remote
git remote add gitlab https://gitlab.com/lptq-jatim/huffadz-jatim.git

# Push ke GitLab
git push gitlab main
```

### 2. Setup GitLab CI/CD

Create file `.gitlab-ci.yml`:

```yaml
image: node:18

stages:
  - build
  - deploy

build:
  stage: build
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - .next/
      - node_modules/

deploy:
  stage: deploy
  script:
    - echo "Deploy to production server"
    # Add your deployment script here
  only:
    - main
```

### 3. Auto-Sync GitHub → GitLab

Setup GitHub Action untuk auto-push ke GitLab:

Create `.github/workflows/sync-gitlab.yml`:

```yaml
name: Sync to GitLab

on:
  push:
    branches: [main]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Push to GitLab
        run: |
          git remote add gitlab https://gitlab.com/lptq-jatim/huffadz-jatim.git
          git push gitlab main --force
```

---

## 📊 Monitoring & Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs huffadz-jatim

# Monitor resources
pm2 monit
```

### Backup Database

Backup Supabase database secara berkala:
1. Buka Supabase Dashboard
2. Database > Backups
3. Schedule automatic backups

### Performance Monitoring

Gunakan tools:
- **Vercel Analytics** (jika deploy di Vercel)
- **Google Analytics**
- **Sentry** untuk error tracking

---

## 🚨 Troubleshooting

### Build Error

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Nginx Error

```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

## ✅ Deployment Checklist

- [ ] Code pushed ke GitHub
- [ ] Environment variables configured
- [ ] Database Supabase ready
- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] Application tested in production
- [ ] Monitoring setup
- [ ] Backup strategy in place

---

## 📞 Support

Jika ada masalah deployment:
- Check logs: `pm2 logs` atau Vercel dashboard
- Verifikasi environment variables
- Test database connection
- Check server resources (RAM, disk space)

**Selamat! Aplikasi Anda sudah live! 🎉**
