# 🇸🇪 Kungen Hoppar Flaggor - Nationaldag Spel 👑

Ett roligt plattformsspel för svenska nationaldagen där kungen hoppar över flaggor och samlar kronor!

## 🚀 Snabb Start (Lokal utveckling)

1. Öppna `index.html` direkt i webbläsaren för att spela lokalt

## ☁️ Cloudflare Deployment

### Förutsättningar
```bash
npm install -g wrangler
```

### Steg-för-steg deployment:

1. **Installera dependencies:**
```bash
npm install
```

2. **Logga in på Cloudflare:**
```bash
wrangler login
```

3. **Skapa D1 databas:**
```bash
wrangler d1 create kungen-db
```

4. **Uppdatera wrangler.toml:**
Kopiera database_id från ovanstående kommando och lägg in i `wrangler.toml`

5. **Skapa databas schema:**
```bash
wrangler d1 execute kungen-db --file=./schema.sql
```

6. **Testa lokalt:**
```bash
npm run dev
```

7. **Deploya till Cloudflare:**
```bash
npm run deploy
```

## 🎮 Spelmekanik

- **Kontroller:** MELLANSLAG för att hoppa
- **Mål:** Hoppa över svenska flaggor och samla kronor
- **Poäng:** 10 kronor per insamlad krona
- **Utmaning:** Hastigheten ökar över tid!
- **Topplista:** Permanenta high scores via Cloudflare D1

## 🏗️ Teknisk Stack

- **Frontend:** Vanilla JavaScript + HTML5 Canvas
- **Backend:** Cloudflare Workers
- **Databas:** Cloudflare D1 (SQLite)
- **Hosting:** Cloudflare Pages/Workers
- **Stil:** Svenska färger (blå & gul) för nationaldag-känsla

## 📊 API Endpoints

- `GET /api/scores` - Hämta topplista
- `POST /api/scores` - Spara ny poäng

## 🎨 Features

✅ Detaljerad kung-karaktär med krona
✅ Äkta svenska flaggor som hinder  
✅ Samla kronor för poäng
✅ Snabb och utmanande gameplay
✅ Permanent topplista
✅ Responsiv design
✅ Svenska texter och emojis

## 🔧 Utveckling

För lokal utveckling med databas:
```bash
wrangler d1 execute kungen-db --local --file=./schema.sql
npm run dev
```

## 📝 Todo (framtida förbättringar)

- [ ] Ljudeffekter (svenska fanfarer!)
- [ ] Animerade sprites
- [ ] Power-ups (dalahästar?)
- [ ] Mobil touch-kontroller
- [ ] Delning på sociala medier
- [ ] Midsommar special edition

Grattis på nationaldagen! 🇸🇪👑 