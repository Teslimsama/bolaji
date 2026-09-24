# Deploying: Laravel API on a VPS + React SPA on Vercel

This app is split into two deployables:

- **Vercel** hosts the React SPA (a client-side router). Build output lives in `dist/`.
- **VPS** hosts Laravel and serves only the JSON API (`/api/*`), photo previews (`/preview/photo/*`), and the health check (`/up`). Private data stays server-side.

---

## 1. VPS: Laravel API

### Prerequisites on the VPS
- PHP 8.3+ (extensions: mbstring, gd, pdo_mysql, fileinfo, openssl, tokenizer, xml, ctype, json, bcmath)
- Composer
- MySQL 8+
- Nginx + PHP-FPM

### Steps

```bash
# upload the repo (or git clone), then:
cd /var/www/bolaji

composer install --no-dev --optimize-autoloader

# create .env for production
cp .env.example .env
```

`.env` values:

```
APP_ENV=production
APP_URL=https://api.yourdomain.com        # or http://SERVER_IP
APP_DEBUG=false
APP_KEY=base64:...                         # run: php artisan key:generate

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bolaji_registry
DB_USERNAME=bolaji
DB_PASSWORD=strongpassword

FRONTEND_URL=https://your-app.vercel.app   # CORS allows this origin to call /api/*
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

The `FRONTEND_URL` env feeds `config/cors.php` (already added). Change it once Vercel gives you the real URL.

```bash
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force                # demo Bolaji data + profile photos
chmod -R 775 storage bootstrap/cache
```

### Nginx site (e.g. `/etc/nginx/sites-available/bolaji`)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    root /var/www/bolaji/public;
    index index.php;

    charset utf-8;
    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable and reload:

```bash
ln -s /etc/nginx/sites-available/bolaji /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Optional: HTTPS
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d api.yourdomain.com
```

Verify the API is live:

```bash
curl http://127.0.0.1/api/branches          # -> {"branches": [...]}
curl http://127.0.0.1/up                    # -> ok
curl http://127.0.0.1/preview/photo/1       # -> PNG bytes
```

---

## 2. Vercel: React SPA

The SPA is already converted to a **client-side router** (no Laravel on Vercel). Files responsible:

- `index.html`  --  static shell with `<div id="app">`
- `vite.vercel.config.js`  --  builds `dist/`
- `vercel.json`  --  rewrites every non-`/api/*` path to `index.html`
- `resources/js/api.ts`  --  calls `VITE_API_URL`, sends the Sanctum bearer token
- `resources/js/router.tsx`  --  client routing, backed by browser history

### Steps

1. Push the repo to GitHub.
2. In Vercel, **Import Project** -> New Project -> set root to the repo.
3. Framework preset: **Vite**.
4. Build command: `npm run build:vercel`  (outputs `dist/`)
5. Output directory: `dist`
6. Environment variable:
   - `VITE_API_URL` = `https://api.yourdomain.com`
7. Deploy.

### Local check before deploy

```bash
npm run build:vercel
npx vite preview --port 8351          # open http://localhost:8351
```

Auth flow after deploy: sign in on the Vercel site -> `Login.tsx` POSTs to
`VITE_API_URL/api/login` -> stores the Sanctum token in `localStorage`
(key `ck_token`) -> every subsequent call in `api.ts` sends
`Authorization: Bearer <token>`. The `/api/*` path is never served by Vercel
(rewrite rules + browser calls to the VPS directly).

---

## 3. First-run checklist

- [ ] `FRONTEND_URL` on the VPS matches the exact Vercel URL (no trailing slash).
- [ ] `VITE_API_URL` on Vercel matches the VPS URL.
- [ ] CORS: `curl -X OPTIONS -H "Origin: https://your-app.vercel.app" -H "Access-Control-Request-Method: GET" https://api.yourdomain.com/api/branches` returns `access-control-allow-origin`.
- [ ] Health: `https://api.yourdomain.com/up` -> ok.
- [ ] Login works from the Vercel site (Dashboard counts + admin queue appear).

## 4. Notes

- **DB is demo-seeded** (`php artisan db:seed`). Records are real-looking Bolaji
  data with generated profile photos on the private disk; both are reset by
  running the seeder again.
- **Photo previews** render without auth on `/preview/photo/{member}`
  (public demo endpoint). Real member uploads still go through
  `/api/media/serve/{member}/photo` behind `verified.member`.
- **`dist/` is a build artifact**  --  add it to `.gitignore` unless you want it committed.
- Keeping `npm run build` (laravel output to `public/build`) intact means the app
  still runs locally with `php artisan serve` the same way as before.