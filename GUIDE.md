# Crestkeeper  --  demo guide

A private lineage registry for the Bolaji family. This guide covers the seeded demo data, the screens, and how to use it day to day.

## Run it

```
php artisan serve --host=127.0.0.1 --port=8000
```

Open `http://127.0.0.1:8000` in a browser.

The database is already seeded (24 members, 4 generations, 6 branches, verification queue, profile photos). You can reseed any time:

```
php artisan migrate:fresh --seed
```

## Demo accounts (all passwords: `password`)

| email                | role  | linked member                                        |
|----------------------|-------|------------------------------------------------------|
| admin@bolaji.test    | admin | Bamidele Bolaji (eldest son, Ibadan House)           |
| elder@bolaji.test    | elder | Chief Adeleke Bolaji (founding generation)           |
| member1@bolaji.test  | member| Morayo Bolaji                                            |
| member2@bolaji.test  | member| Kolawole Bolaji                                          |
| member3@bolaji.test  | member| Ifeoluwa Bolaji                                          |
| member4@bolaji.test  | member| Aramide Bolaji                                            |

- Admins can access the verification queue and dashboard endpoints.
- Elders (and admins) can review verification requests.
- Members can browse the tree and ask how two people are related once their own membership is verified.

## Screens

- **/ (home)**  --  asymmetric homepage: crest + adire motif rail, lineage stat strip. The stat strip loads real counts from `/api/branches`.
- **/dashboard**  --  stat cards (verified / pending / reviews open / completed) plus an "ask a relative" box. Sign in first via API (see below) for live numbers; the cards otherwise show in your terminal data.
- **/tree**  --  the four-generation tree, oldest at top. Parchment person cards on adire connecting lines. Click any card to inspect that member.
- **/find**  --  search members by name via `/api/members?search=...`, then "how are we connected?" calls `/api/me/relationship/{id}` and shows the chain, degrees, and close-family warning (kola accent).
- **/admin/queue**  --  the verification queue data table. Click "open verification" to slide in the review drawer (adire skin) with approve / request-more-info / close actions.
- **/login, /request-access, /me, /me/verify**  --  lightweight auth screens (sentence-case, parchment/brass styling).

## Dummy profile photos

Every member has a generated PNG avatar on the private disk (`storage/app/private/photos/{member_id}/profile.png`). They render on the site without login at:

```
/preview/photo/{member_id}
```

The authenticated endpoint (used by real uploads) is `GET /api/media/serve/{member}/photo`. To replace a photo as admin: `POST /api/members/{id}/photo` with a file field named `photo`.

## API quick reference

All JSON. Login first:

```
POST /api/login
{"email":"admin@bolaji.test","password":"password"}

 ->  {"token":"...", "user":{...}}
```

Use `Authorization: Bearer <token>` for the rest:

| endpoint | notes |
|----------|-------|
| `GET /api/me` | current user + linked member |
| `GET /api/members?search=...` | search verified members |
| `GET /api/members/{id}/profile` | member profile |
| `GET /api/me/relationship/{memberId}` | how *you* relate to that member |
| `GET /api/tree` | full family tree |
| `GET /api/admin/dashboard` | admin counts + recent audit |
| `GET /api/verifications` | verification queue |
| `POST /api/verifications/{id}/review` `{status: approved|more_info|rejected}` | review a request |
| `GET /api/branches` | public branch list with member counts |
| `GET /api/announcements`  /  `GET /api/events` | public content |

Relationship response example:

```json
{"result":{
  "subject": {"full_name":"Bamidele Bolaji", "branch":"Ijesha Branch"},
  "label": "Uncle",
  "kin_type": "aunt_uncle",
  "chain_side": "aunt_nephew",
  "common_ancestor": {"full_name":"Adeleke Bolaji"},
  "degrees": {"m":1, "n":2},
  "close_family_warning": true,
  "close_family_reason": "Shares an ancestor within 4 generations.",
  "details": "Bamidele Bolaji is the Uncle of Ifeoluwa Bolaji.",
  "path": [...]
}}
```

Not connected  ->  `null` (use it to show "no connection found").