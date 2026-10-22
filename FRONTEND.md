# Tahrir API — frontend qo‘llanma

Bu backend Tahrir sayti uchun REST API. Frontend sahifalarni chizadi, ma’lumotni shu API dan oladi.

## Qanday ishlaydi (qisqa)

1. Frontend `fetch` / `axios` bilan so‘rov yuboradi.
2. Yo‘llarda `/api` prefiksi yo‘q. Masalan: `/auth/login`, `/health`.
3. Javob JSON. Muvaffaqiyat: `{ "success": true, "data": ... }`.
4. Login kerak bo‘lsa header: `Authorization: Bearer <token>`.
5. Token `POST /auth/login` yoki `register` dan keladi. Uni `localStorage` da saqlang.

Swagger (barcha endpointlar, sinab ko‘rish): `{BASE}/docs`

---

## Base URL

| Muhit | URL |
|---|---|
| Lokal | `http://localhost:3000` |
| Production (Railway) | `https://tahrir-backend-production-524d.up.railway.app` |

Frontend `src/constants/api.js` (yoki env):

```js
export const BASE_URL = "https://tahrir-backend-production-524d.up.railway.app/";
```

**Muhim:** oldida `/api` yozilmaydi. To‘g‘ri: `/health`. Noto‘g‘ri: `/api/health`.

CORS ochiq (`origin: true`, `credentials: true`).

---

## Axios misol

```js
import axios from "axios";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Login dan keyin: `localStorage.setItem("token", res.data.data.token)`.

Agar frontend hozir `x-auth-token` ishlatsa — backend **faqat** `Authorization: Bearer` ni o‘qiydi. Interceptorda Bearer ga o‘tkazing.

---

## Javob formati

Muvaffaqiyat:

```json
{ "success": true, "data": { } }
```

Ro‘yxat + pagination:

```json
{
  "success": true,
  "data": [ ],
  "meta": { "total": 20, "page": 1, "limit": 10, "totalPages": 2 }
}
```

Xato:

```json
{ "success": false, "statusCode": 401, "message": "Unauthorized", "errors": null }
```

UI da `success === false` yoki HTTP 4xx/5xx da `message` ni ko‘rsating.

Fayl yuklab olish (`GET /documents/:id/download`) JSON emas — binary stream.

---

## Auth qoidalari

| Belgi | Ma’nosi |
|---|---|
| Ochiq | Token shart emas |
| User | Login qilgan har qanday user |
| Admin / Manager | Faqat shu rol. Boshqalar 403 |

Rollar: `user` | `manager` | `admin`

### Demo hisoblar (seed)

| Rol | Email | Parol |
|---|---|---|
| Admin | `admin@tahrir.uz` | `Admin1234!` |
| User | `user@tahrir.uz` | `User1234!` |

---

## 1. Health / landing

| Method | Path | Kim | Nima qiladi |
|---|---|---|---|
| GET | `/health` | Ochiq | Backend va DB ishlayaptimi |
| GET | `/stats` | Ochiq | Landing uchun demo raqamlar (`users`, `documents`, `accuracy`) |

---

## 2. Auth — kirish / ro‘yxat

Sahifa: login, register, parolni unutdim, header dagi “men”.

| Method | Path | Kim | Body | Nima qiladi |
|---|---|---|---|---|
| POST | `/auth/register` | Ochiq | `fullName`, `email`, `password`, `confirmPassword` | Yangi user. Javobda `token` + `user` |
| POST | `/auth/login` | Ochiq | `email`, `password` (min 8) | Kirish. Javobda `token` + `user` |
| GET | `/auth/me` | User | — | Hozirgi user (sahifa yangilanganda token tekshirish) |
| POST | `/auth/forgot-password` | Ochiq | `email` | Reset token yaratadi (email yuborilmaydi — demo). Xavfsizlik uchun doim bir xil xabar |
| POST | `/auth/reset-password` | Ochiq | `token`, `password` | Yangi parol |

Login javobi (`data` ichida):

```json
{
  "token": "eyJ...",
  "user": {
    "id": "uuid",
    "fullName": "Demo User",
    "email": "user@tahrir.uz",
    "role": "user",
    "isActive": true,
    "plan": null
  }
}
```

Frontend: `token` ni saqla, `user.role === "admin"` bo‘lsa admin panelga yo‘naltir.

---

## 3. Users — profil va admin

Sahifa: profil sozlamalari, admin → foydalanuvchilar.

| Method | Path | Kim | Nima qiladi |
|---|---|---|---|
| GET | `/users/me` | User | O‘z profili |
| PATCH | `/users/me` | User | `fullName`, `password` (ixtiyoriy) |
| GET | `/users?page=1&limit=10&search=` | Admin | Barcha userlar |
| POST | `/users` | Admin | User yaratish: `fullName`, `email`, `password`, `role?` |
| GET | `/users/:id` | Admin | Bitta user |
| PATCH | `/users/:id` | Admin | `fullName`, `email`, `role`, `isActive` |
| DELETE | `/users/:id` | Admin | O‘chirish |

---

## 4. Grammar — asosiy mahsulot

Sahifa: matn tekshirish, qayta yozish, tahlil.

| Method | Path | Kim | Body | Nima qiladi |
|---|---|---|---|---|
| POST | `/grammar/check` | Ochiq (token bo‘lsa tarix saqlanadi) | `{ "text": "..." }` | Imlo xatolari |
| GET | `/grammar/history` | User | — | Oxirgi 50 ta tekshiruv |
| POST | `/rewrite` | Ochiq | `{ "text": "...", "style": "formal" }` | Matnni qayta yozish |
| POST | `/analysis` | Ochiq | `{ "text": "..." }` | Statistika / tahlil |

`style`: `simpler` | `formal` | `shorter` | `detailed`

Check javobi (`data`):

```json
{
  "text": "...",
  "issues": [
    { "start": 10, "end": 18, "suggestion": "ko'rsatadi", "message": "...", "type": "spelling" }
  ],
  "words": 12,
  "chars": 80
}
```

`type`: `spelling` | `punct` | `style`. Editor da `start`/`end` bilan highlight qiling.

---

## 5. Documents — fayl yuklash

Sahifa: mening hujjatlarim. **Token shart.**

| Method | Path | Kim | Nima qiladi |
|---|---|---|---|
| POST | `/documents` | User | Yuklash. `multipart/form-data`, maydon nomi **`file`**. Max 20 MB |
| GET | `/documents` | User | Mening fayllarim |
| GET | `/documents/:id` | User | Bitta fayl meta |
| GET | `/documents/:id/download` | User | Faylni yuklab olish (binary) |
| DELETE | `/documents/:id` | User | O‘chirish |

Upload:

```js
const form = new FormData();
form.append("file", fileInput.files[0]);
await api.post("/documents", form, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

---

## 6. Plans va subscriptions

Sahifa: narxlar, “tarif tanlash”.

| Method | Path | Kim | Nima qiladi |
|---|---|---|---|
| GET | `/plans` | Ochiq | Barcha tariflar (Free, Plus, Pro, Team) |
| GET | `/plans/:id` | Ochiq | Bitta tarif |
| POST | `/plans` | Admin | Yangi tarif |
| PATCH | `/plans/:id` | Admin | Yangilash |
| DELETE | `/plans/:id` | Admin | O‘chirish |
| POST | `/subscriptions` | User | Obuna: `{ "planId": "uuid", "billingPeriod": "monthly" }` |
| GET | `/subscriptions/me` | User | Mening obunalarim |
| PATCH | `/subscriptions/:id/cancel` | User | Bekor qilish |

`billingPeriod`: `monthly` | `yearly`

To‘lov (karta) yo‘q — obuna darhol yoziladi (demo).

---

## 7. Contact va newsletter

Sahifa: “Bog‘lanish”, footer email.

| Method | Path | Kim | Body | Nima qiladi |
|---|---|---|---|---|
| POST | `/contact` | Ochiq | `fullName`, `email`, `phone?`, `message` (min 5) | Forma yuborish |
| GET | `/contact?page=&limit=` | Admin/Manager | — | Inbox |
| GET | `/contact/:id` | Admin/Manager | — | Bitta xabar |
| PATCH | `/contact/:id` | Admin/Manager | `{ "status": "read" }` | Status: `new` \| `read` \| `replied` |
| DELETE | `/contact/:id` | Admin | — | O‘chirish |
| POST | `/newsletter` | Ochiq | `{ "email": "..." }` | Email obuna |
| GET | `/newsletter` | Admin/Manager | — | Obunachilar ro‘yxati |

---

## 8. Blog, news, FAQ

Sahifa: blog, yangiliklar, savol-javob. O‘qish ochiq, yozish admin.

**Blog**

| Method | Path | Kim |
|---|---|---|
| GET | `/blog/categories` | Ochiq |
| POST | `/blog/categories` | Admin/Manager — `{ "name": "..." }` |
| GET | `/blog?page=1&limit=10&search=&category=` | Ochiq. `category=All articles` hammasi |
| GET | `/blog/:id` | Ochiq |
| POST | `/blog` | Admin/Manager — `title`, `excerpt`, `content`, `categoryId?`, `isPublished?` |
| PATCH | `/blog/:id` | Admin/Manager |
| DELETE | `/blog/:id` | Admin |

**News**

| Method | Path | Kim |
|---|---|---|
| GET | `/news?page=&limit=` | Ochiq |
| GET | `/news/:id` | Ochiq |
| POST | `/news` | Admin/Manager — `title`, `excerpt`, `content`, `isPublished?` |
| PATCH | `/news/:id` | Admin/Manager |
| DELETE | `/news/:id` | Admin |

**FAQ**

| Method | Path | Kim |
|---|---|---|
| GET | `/faq/topics` | Ochiq |
| GET | `/faq?tab=popular&search=` | Ochiq. `tab`: `popular` \| `guides` \| `trouble` |
| POST | `/faq/topics` | Admin/Manager |
| POST | `/faq` | Admin/Manager — `question`, `answer`, `tab` |
| DELETE | `/faq/:id` | Admin |

---

## 9. Products va categories

Katalog (agar frontendda shop/katalog bo‘lsa).

| Method | Path | Kim |
|---|---|---|
| GET | `/categories` | Ochiq |
| GET | `/categories/:id` | Ochiq |
| POST | `/categories` | Admin/Manager — `{ "name", "description?" }` |
| PUT | `/categories/:id` | Admin/Manager |
| DELETE | `/categories/:id` | Admin |
| GET | `/products?page=&limit=&categoryId=` | Ochiq |
| GET | `/products/search?search=` | Ochiq |
| GET | `/products/part/search?search=` | Ochiq (qisman qidiruv) |
| GET | `/products/:id` | Ochiq |
| POST | `/products` | Admin/Manager — `name`, `price`, `description?`, `sku?`, `categoryId?` |
| PUT | `/products/:id` | Admin/Manager |
| DELETE | `/products/:id` | Admin |

---

## Pagination

Ko‘p `GET` ro‘yxatlar:

`?page=1&limit=10&search=soz`

Javobdagi `meta` ni pagination UI ga ulashing.

---

## Frontend qaysi API ni qayerda chaqiradi

| Sahifa | Endpoint |
|---|---|
| Home / stats | `GET /stats` |
| Login | `POST /auth/login` |
| Register | `POST /auth/register` |
| App ochilishi | `GET /auth/me` (token bor bo‘lsa) |
| Matn tekshirish | `POST /grammar/check` |
| Qayta yozish | `POST /rewrite` |
| Tahlil | `POST /analysis` |
| Tekshiruv tarixi | `GET /grammar/history` |
| Hujjatlar | `/documents` |
| Tariflar | `GET /plans`, `POST /subscriptions` |
| Blog | `/blog` |
| Yangiliklar | `/news` |
| FAQ | `/faq` |
| Contact forma | `POST /contact` |
| Newsletter | `POST /newsletter` |
| Profil | `GET/PATCH /users/me` |
| Admin panel | `/users`, `/contact`, `/blog` POST, `/news` POST, `/plans` POST |

---

## HTTP kodlar

| Kod | Qachon |
|---|---|
| 200 / 201 | OK |
| 400 | Validatsiya (parol qisqa, email noto‘g‘ri) |
| 401 | Token yo‘q / noto‘g‘ri / muddati o‘tgan |
| 403 | Rol yetarli emas (user admin API ga kirdi) |
| 404 | Noto‘g‘ri path yoki ID |

---

## Tezkor tekshiruv

```bash
curl https://tahrir-backend-production-524d.up.railway.app/health
```

Kutilgan: `{ "success": true, "data": { "status": "ok", ... } }`

Postman: `postman/Tahrir-API.postman_collection.json`  
Environment: `postman/Tahrir-API.postman_environment.json`  
`baseUrl` = `https://tahrir-backend-production-524d.up.railway.app` (`/api` siz).
