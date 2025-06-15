# ☕️ Kofi

<div align="center">
  <img src="./kava-app/assets/KavniJunak.png" alt="Kofi Logo" width="200"/>
</div>

## O projektu

**Kofi** je mobilna aplikacija za ljubitelje kave, ki omogoča deljenje in ocenjevanje izkušenj s kavo iz različnih kavarn. Uporabniki lahko delijo fotografije svoje kave, jo ocenijo, opišejo okus in interagirajo z drugimi kavoljubi preko komentarjev in všečkov.

## Funkcionalnosti

### Trenutno dostopno (Alpha verzija):
- **Registracija in prijava** - Varno upravljanje uporabniških računov
- **Deljenje fotografij** - Objavljanje slik kave iz galerije ali kamere
- **Ocena kave** - Ocenjevanje kave od 1-5 zvezdic
- **Opis kave** - Možnost dodajanja opisa okusa in izkušnje
- **Všečkanje objav** - Interakcija z objavami drugih uporabnikov
- **Komentiranje** - Deljenje mnenj in izkušenj v komentarjih
- **Real-time posodobitve** - Takojšnje posodabljanje všečkov in komentarjev

### Načrtovane funkcionalnosti za naprej:
- Lokacija kavarn
- Označevanje kavarn
- Uporabniški profili
- Iskanje po kavarnah in uporabnikih
- Statistike najljubših kav

## Tehnologije

### Frontend:
- **React Native** (Expo) - Cross-platform mobilni razvoj
- **React Navigation** - Navigacija med zasloni
- **Expo Image Picker** - Izbira slik iz galerije/kamere

### Backend:
- **Supabase** - Backend-as-a-Service
  - Avtentikacija uporabnikov
  - Real-time subscriptions
  - File storage za slike

### Styling:
- **React Native StyleSheet** - Prilagojeni stili
- **Expo Vector Icons** - Ikone za UI

## Namestitev in zagon

### Predpogoji:
- Node.js (verzija 18+)
- npm ali yarn
- Expo CLI
- Android Studio / Xcode (za emulatorje)

### Lokalni razvoj:

1. **Kloniraj repozitorij:**
```bash
git clone https://github.com/KuminM/kofi.git
cd kofi/kava-app
```

2. **Namesti odvisnosti:**
```bash
npm install
```

3. **Nastavi okoljske spremenljivke:**
Ustvari `.env` datoteko z Supabase konfiguracijami:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Zaženi aplikacijo:**
```bash
# Razvoj
npm start

# Android
npm run android

# iOS
npm run ios

# Web verzija
npm run web

## Struktura projekta

```
kava-app/
├── screens/          # Zasloni aplikacije
│   ├── Login.js      # Prijava
│   ├── Register.js   # Registracija
│   ├── Feed.js       # Glavni feed z objavami
│   └── Profil.js     # Uporabniški profil
├── Styles/           # Styling datoteke
│   ├── feedStyles.js # Stili za feed
│   └── ikonce/       # Prilagojene ikone
├── backend/          # Backend konfiguracija
│   └── supabase.js   # Supabase setup
├── assets/           # Slike in ikone
└── App.js           # Glavna aplikacija
```

## Uporaba

1. **Registracija/Prijava:** Ustvari račun ali se prijavi
2. **Brskanje:** Preglej objave drugih uporabnikov na glavnem feedu
3. **Objavljanje:** Klikni "Objavi kavico" za dodajanje nove objave
4. **Ocenjevanje:** Dodaj sliko, opis in oceno (1-5 zvezdic)
5. **Interakcija:** Všečkaj objave in dodajaj komentarje
6. **Upravljanje:** Briši svoje objave in komentarje (swipe gesture)

<div align="center">
  <strong>Kofi - Kjer se srečajo ljubitelji kave ☕️</strong>
</div>
