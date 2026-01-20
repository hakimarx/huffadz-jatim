# OAuth Setup Guide - Huffadz Jatim

## Supabase Dashboard Configuration

### Step 1: Fix Email Redirect URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (sczdpueymqspwnhbuomf)
3. Navigate to **Authentication** → **URL Configuration**
4. Update settings:
   - **Site URL**: `https://huffadz-jatim.vercel.app`
   - **Redirect URLs** (add both):
     - `https://huffadz-jatim.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`

### Step 2: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Navigate to **APIs & Services** → **OAuth consent screen**
   - Configure app name: "Huffadz Jatim"
   - Add authorized domains: `huffadz-jatim.vercel.app`, `supabase.co`
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
   - Application type: Web application
   - Authorized redirect URI: `https://sczdpueymqspwnhbuomf.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret**
6. In Supabase Dashboard → **Authentication** → **Providers** → Enable **Google**
7. Paste Client ID and Secret

### Step 3: Configure Facebook OAuth

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create new app (Consumer type)
3. Add **Facebook Login** product
4. Go to **Facebook Login** → **Settings**
   - Valid OAuth Redirect URI: `https://sczdpueymqspwnhbuomf.supabase.co/auth/v1/callback`
5. Copy **App ID** and **App Secret** from **Settings** → **Basic**
6. In Supabase Dashboard → **Authentication** → **Providers** → Enable **Facebook**
7. Paste App ID and Secret

## Testing

After configuration:
1. Visit `http://localhost:3000/login` or `https://huffadz-jatim.vercel.app/login`
2. Click "Masuk dengan Google" or "Masuk dengan Facebook"
3. Complete OAuth flow
4. Should redirect to dashboard

## Troubleshooting

- **"Email not confirmed"**: Check Supabase Dashboard → Authentication → Users → Confirm email manually
- **OAuth redirect error**: Verify redirect URLs are correctly configured in both Google/Facebook console and Supabase
- **hakim.luk81@gmail.com login issue**: After fixing Site URL, user may need to request new confirmation email or have admin confirm manually
