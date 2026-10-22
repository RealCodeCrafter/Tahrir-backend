# Tahrir Backend

Tahrir frontend uchun NestJS + TypeORM + PostgreSQL.

## Ishga tushirish

```bash
copy .env.example .env
npm install
npm run start:dev
```

- Backend: https://tahrir-backend-production-524d.up.railway.app
- Lokal: http://localhost:3000
- Swagger: `/docs`
- Postman: `postman/Tahrir-API.postman_collection.json`

**Oldida `/api` yo'q.** Masalan: `/health`, `/auth/login`, `/plans`.

Frontend `BASE_URL`:

```js
"https://tahrir-backend-production-524d.up.railway.app/"
```

## Demo hisoblar

| Rol   | Email            | Parol       |
|-------|------------------|-------------|
| Admin | admin@tahrir.uz  | Admin1234!  |
| User  | user@tahrir.uz   | User1234!   |

Token: `Authorization: Bearer <token>`
