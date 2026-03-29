# 🍽️ Polední menu

Jednoduchý, bezpečný systém pro restaurace, bistra a hospody, které chtějí mít na webu denní polední menu bez složité editace.

**Majitel restaurace:** nahraje fotku menu → vybere datum → hotovo.  
**Zákazník:** otevře web nebo naskenuje QR → vidí dnešní menu.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Postgres + Storage)
- **Sharp** (zpracování obrázků)
- **jose** (JWT sessions)
- **bcrypt** (hashování hesel)

## Rychlý start

### 1. Naklonuj a nainstaluj

```bash
git clone <repo-url>
cd poledni-menu
npm install
```

### 2. Nastav Supabase

1. Vytvoř nový projekt na [supabase.com](https://supabase.com)
2. Spusť SQL migraci: obsah souboru `supabase/migration.sql` vlož do SQL Editoru v Supabase dashboardu
3. Ověř, že se vytvořil Storage bucket `daily-menus` (pokud ne, vytvoř ho ručně jako **public** bucket)

### 3. Nastav environment

```bash
cp .env.example .env
```

Vyplň v `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` – URL tvého Supabase projektu
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` – service role key (nikdy nekopíruj na klient!)
- `SESSION_SECRET` – náhodný řetězec, min. 32 znaků (např. `openssl rand -base64 32`)

### 4. Vytvoř testovací restauraci

Uprav údaje v `scripts/seed.ts` (název, slug, heslo, telefon) a spusť:

```bash
npx tsx scripts/seed.ts
```

### 5. Spusť lokálně

```bash
npm run dev
```

### 6. Otevři

| Co | URL |
|---|---|
| Web restaurace | `http://localhost:3000/bistro-na-poli` |
| Menu stránka (pro QR) | `http://localhost:3000/bistro-na-poli/menu` |
| Admin | `http://localhost:3000/bistro-na-poli/admin` |

## Jak to funguje

### Veřejná část

- **Pracovní den + menu existuje:** zobrazí fotku menu s datem, kliknutím se zvětší
- **Pracovní den + menu neexistuje:** fallback „Dnešní menu právě připravujeme"
- **Víkend:** fallback „O víkendu vaříme ze stálého menu"

Menu se řídí **datem platnosti**, ne datem uploadu. Majitel může nahrát úterní menu už v pondělí večer.

### Admin

1. Jdi na `/bistro-na-poli/admin`
2. Zadej heslo
3. Vidíš dashboard se stavem dnes/zítra
4. Nahraj fotku menu + vyber datum
5. Hotovo

Nové menu pro stejné datum automaticky nahradí původní.

### Bezpečnost

- Heslo hashované bcrypt (12 rounds)
- JWT session v HttpOnly/Secure/SameSite cookie
- **Middleware** ověřuje JWT na serveru před vstupem na admin stránky
- Rate limiting login pokusů (5 za 15 min)
- Server-side validace uploadu (MIME, velikost, Sharp reprocess)
- Soubory přejmenovány serverem, nikdy se nepoužívá originální název
- Password hash se nikdy neposílá na klient (explicitní column select)
- Login API používá service role klient, veřejné dotazy anon klient
- Data restaurací jsou oddělená

## Přidání další restaurace

Uprav `scripts/seed.ts` s novými údaji a spusť znovu, nebo vlož ručně do DB:

```sql
INSERT INTO restaurants (slug, name, password_hash, phone)
VALUES ('moje-hospoda', 'Moje Hospoda', '<bcrypt-hash>', '+420...');
```

Hash hesla vygeneruješ v Node.js:

```js
const bcrypt = require('bcrypt');
bcrypt.hash('moje-heslo', 12).then(console.log);
```

## Timezone

Veškerá logika data běží v **Europe/Prague**. Nezáleží na timezone serveru.

## Struktura projektu

```
src/
├── middleware.ts            # Server-side ochrana admin rout (JWT)
├── app/
│   ├── api/
│   │   ├── auth/login/      # POST login (bcrypt, rate-limit)
│   │   ├── auth/logout/     # POST logout
│   │   └── menu/upload/     # POST upload (Sharp, validace)
│   ├── [slug]/
│   │   ├── page.tsx         # Homepage restaurace
│   │   ├── menu/            # Standalone menu stránka (QR)
│   │   └── admin/
│   │       ├── page.tsx     # Redirect login/dashboard
│   │       ├── login/       # Login stránka
│   │       └── menu/        # Admin dashboard
│   ├── globals.css          # Catchflow design system
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Root page
│   └── not-found.tsx        # 404
├── components/
│   ├── admin/               # LoginForm, UploadForm, LogoutButton
│   ├── public/              # MenuSection, MenuCard
│   └── ui/                  # Lightbox
├── lib/
│   ├── auth/                # Session (JWT/jose), rate-limit
│   ├── date/                # Prague timezone utility
│   ├── menu/                # Business logic (display, upload)
│   ├── supabase/            # Klienti (public, admin)
│   └── constants.ts         # Limity, povolené typy
└── types/                   # TypeScript definice
```

---

Vytvořeno pro [Catchflow](https://catchflow.cz).
