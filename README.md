# Crestkeeper

A private lineage registry for the Bolaji family. Members are drawn as parchment
person cards across four generations, connected by adire-indigo lines. Claims are
reviewed by family elders before a member is verified.

Stack: Laravel (API) + React (client-side SPA) + Vite + Tailwind CSS. The SPA
calls the Laravel API over JSON; profile photos are stored on the private disk.

## Screens

- `GET /` - public home: asymmetric split, crest + adire motif rail, lineage stat strip (live from `/api/branches`)
- `GET /dashboard` - stat cards (verified / pending / reviews open / completed) and an "ask a relative" box
- `GET /tree` - the four-generation family tree, oldest at top; parchment cards on adire connecting lines
- `GET /find` - search members, then ask "how are we connected?" and see the chain, degrees, and close-family warning
- `GET /admin/queue` - the verification queue data table with a slide-in review drawer (approve / request more info)
- `GET /login`, `/request-access`, `/me`, `/me/verify` - auth screens

## Run locally

```bash
git clone <your-repo> bolaji
cd bolaji
composer install
npm install
cp .env.example .env          # set DB_* for your MySQL
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force   # demo Bolaji data + generated profile photos
npm run build                 # Laravel build (public/build)
php artisan serve
```

Open `http://127.0.0.1:8000`.

## Demo accounts

All passwords are `password`.

| email | role | linked member |
|-------|------|---------------|
| admin@bolaji.test | admin | Bamidele Bolaji |
| elder@bolaji.test | elder | Chief Adeleke Bolaji |
| member1@bolaji.test | member | Morayo Bolaji |
| member2@bolaji.test | member | Kolawole Bolaji |
| member3@bolaji.test | member | Ifeoluwa Bolaji |
| member4@bolaji.test | member | Aramide Bolaji |

Admins can open the verification queue. Elders (and admins) can review requests.
Members can browse the tree and ask how two people are related once their own
membership is verified.

## Profile photos

Every member has a generated PNG avatar on the private disk at
`storage/app/private/photos/{member_id}/profile.png`. They render without login at
`/preview/photo/{member_id}`. Real uploads go through
`POST /api/members/{id}/photo` (file field `photo`) and are served at
`GET /api/media/serve/{member}/photo` behind the `verified.member` middleware.

## API

All JSON. Login first:

```
POST /api/login
{"email":"admin@bolaji.test","password":"password"}
```

returns `{"token": "...", "user": { ... }}`. Send `Authorization: Bearer <token>`
on subsequent requests.

| endpoint | access | notes |
|----------|--------|-------|
| `GET /api/branches` | public | branch list with member counts |
| `GET /api/announcements` | public | announcements |
| `GET /api/events` | public | family events |
| `POST /api/request-access` | public | claim a family relation |
| `POST /api/login` / `POST /api/logout` | public / auth | Sanctum bearer tokens |
| `GET /api/me` | auth | current user + linked member |
| `GET /api/members?search=` | verified.member | search members |
| `GET /api/members/{id}/profile` | verified.member | member profile |
| `GET /api/me/relationship/{memberId}` | verified.member | how *you* relate to that member (label, degrees, common ancestor, close-family warning) |
| `GET /api/tree` | verified.member | full family tree |
| `GET /api/admin/dashboard` | admin | counts + recent audit |
| `GET /api/verifications` | elder/admin | verification queue |
| `POST /api/verifications/{id}/review` | elder/admin | `{status: approved|more_info|rejected}` |
| `GET/POST/PUT /api/privacy`, `/api/media` | auth | privacy + media |

Relationship example:

```json
{"result": {
  "subject": {"full_name": "Bamidele Bolaji", "branch": "Ijesha Branch"},
  "label": "Uncle",
  "kin_type": "aunt_uncle",
  "chain_side": "aunt_nephew",
  "common_ancestor": {"full_name": "Adeleke Bolaji"},
  "degrees": {"m": 1, "n": 2},
  "close_family_warning": true,
  "close_family_reason": "Shares an ancestor within 4 generations.",
  "details": "Bamidele Bolaji is the Uncle of Ifeoluwa Bolaji.",
  "path": []
}}
```

`close_family_warning` only appears for recent ancestors. Disconnected people
return `null` for the result.

## Architecture

The SPA is a pure client-side router (`resources/js/router.tsx`) with a token
helper (`resources/js/api.ts`). It ships as static files, so it can be hosted
anywhere: local Laravel serves the shell via `resources/views/app.blade.php` +
built assets, and Vercel serves the same build from `dist/`.

- `vite.config.js` - Laravel build -> `public/build` (used by the Blade shell)
- `vite.vercel.config.js` - static build -> `dist` (`npm run build:vercel`)
- `resources/js/theme.ts` - design tokens (ink / parchment / brass / adire / kola / moss)
- `app/Services/RelationshipService.php` - the relationship resolver (BFS over the family graph)

## Deployment

Split deployment: the **VPS** hosts Laravel (`/api/*`, `/preview/photo/*`,
`/up`), and **Vercel** hosts the built SPA. The full guide (`.env`, Nginx block,
certbot, Vercel settings, first-run checklist) is in [DEPLOY.md](./DEPLOY.md).

## License

The Laravel framework is open-sourced software licensed under the MIT license.