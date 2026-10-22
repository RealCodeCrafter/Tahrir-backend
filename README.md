# Tahrir Backend

Tahrir frontend uchun NestJS + TypeORM + PostgreSQL API.

## Ishga tushirish

```bash
docker compose up -d
copy .env.example .env
npm install
npm run start:dev
```

- API: http://localhost:3000/api
- Swagger: http://localhost:3000/docs
- Postman: `postman/Tahrir-API.postman_collection.json`

Frontend `src/constants/api.js` da:

```js
BASE_URL: "http://localhost:3000/api/"
```

## Demo hisoblar

| Rol   | Email            | Parol       |
|-------|------------------|-------------|
| Admin | admin@tahrir.uz  | Admin1234!  |
| User  | user@tahrir.uz   | User1234!   |

Token: `Authorization: Bearer <token>` (frontend `x-auth-token` bilan mos).

## Asosiy endpointlar

- `POST /api/auth/register` `POST /api/auth/login` `GET /api/auth/me`
- `GET/POST /api/blog` `GET /api/news` `GET /api/faq` `GET /api/plans`
- `POST /api/contact` `POST /api/newsletter`
- `POST /api/grammar/check` `POST /api/rewrite` `POST /api/analysis`
- `POST /api/documents` (multipart `file`)
- `GET /api/products` `GET /api/categories`
