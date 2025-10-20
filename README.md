# Telegram Guruh Tahlilchisi

Telegram guruhlaridagi xabarlarni tahlil qiluvchi dastur. Oxirgi 7 kunlik eng faol muhokamalarni topadi.

## Nima kerak

- Node.js 18+
- Telegram API ma'lumotlari

## O'rnatish

1. **Telegram API olish:**
   - https://my.telegram.org/apps ga o'ting
   - Yangi ilova yarating
   - `api_id` va `api_hash` ni oling

2. **Loyihani sozlash:**
```bash
yarn install
cp .env.example .env
```

3. **.env faylini to'ldiring:**
```env
API_ID=12345678
API_HASH=your_api_hash
PHONE_NUMBER=+998901234567
SESSION_NAME=telegram_session
PORT=3000
```

## Ishlatish

```bash
yarn start:dev
```

Brauzerda oching: http://localhost:3000/api

## API

### POST /analyze

Guruhni tahlil qilish:

```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"groupId": "t.me/nestjs_uz"}'
```

**Qo'llab-quvvatlanadigan formatlar:**
- `t.me/guruh_nomi`
- `https://t.me/guruh_nomi`
- `@guruh_nomi`
- `guruh_nomi`
- `-1001234567890` (shaxsiy guruh)

## Javob

```json
{
  "timezone": "Asia/Tashkent",
  "days": [
    {
      "date": "2025-10-18",
      "threads": [
        {
          "topic": "NestJS qanday ishlatish?",
          "messages": 15,
          "users": 5
        }
      ]
    }
  ]
}
```

## Birinchi marta

Birinchi ishga tushirishda:
1. Dasturni ishga tushiring
2. API so'rovi yuboring
3. Terminalda kod so'raladi
4. Telegramdan kelgan kodni kiriting
5. Keyingi safar avtomatik ishlaydi

## Qanday ishlaydi

1. **Xabarlarni oladi** - oxirgi 7 kunlik barcha xabarlar
2. **Thread'larni topadi** - reply zanjirlar va forum topic'lar
3. **Filtrlash** - faqat 2+ xabar yoki 2+ user bo'lgan muhokamalar
4. **Guruhlash** - kunlar bo'yicha
5. **Saralash** - xabarlar soni bo'yicha

## Muammo bo'lsa

**Agar `days: []` qaytarsa:**
- Guruhda muhokamalar yo'q
- Faqat alohida xabarlar bor
- Faolroq guruhni sinab ko'ring

**Agar xatolik bersa:**
- Guruh ID to'g'ri ekanini tekshiring
- Siz guruh a'zosi ekanligingizni tasdiqlang
- Server log'larini ko'ring

## Loyiha tuzilishi

```
src/
├── analyzer/          # Tahlil qismi
├── telegram/          # Telegram API
├── config/            # Sozlamalar
└── main.ts            # Boshlash
```

## Texnologiyalar

- NestJS
- TypeScript
- GramJS (Telegram API)
- Swagger

## Muallif

Sunnatullo Hayitov
- @code_carft01