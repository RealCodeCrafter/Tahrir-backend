# Tahrir Backend — frontendchi uchun qo'llanma

Bu hujjatni frontendchi o'qishi kifoya. Backend ichidagi NestJS kodini bilish shart emas.

---

## 1. Backend nima qiladi (sodda)

Frontend — sahifa, tugma, forma.  
Backend — ma'lumotni saqlash, tekshirish, foydalanuvchini tanish.

Misol:

1. Foydalanuvchi login formasiga email va parol yozadi.
2. Frontend `POST /api/auth/login` ga so'rov yuboradi.
3. Backend bazadan tekshiradi, to'g'ri bo'lsa **token** qaytaradi.
4. Frontend tokenni `localStorage` ga `x-auth-token` nomi bilan saqlaydi.
5. Keyingi so'rovlarda headerga qo'yadi: `Authorization: Bearer <token>`.
6. Backend token orqali foydalanuvchini taniydi.

PostgreSQL — ma'lumotlar ombori (user, blog, tarif, hujjat...).  
TypeORM — backendning baza bilan gaplashish usuli. Frontend buni ko'rmaydi.

---

## 2. Qanday ishlataman (frontendchi)

### Base URL

```
http://localhost:3000/api
```

Barcha manzillar shu prefiksdan boshlanadi.

Frontendda (`src/constants/api.js`) allaqachon shunday:

```js
BASE_URL: "http://localhost:3000/api/"
```

### Ishga tushirish (backendchi / siz)

1. PostgreSQL ishlashi kerak (`tahrir` user, `tahrir` parol, `tahrir` baza, port `5432`).
2. Backend papkada:

```bash
cd tahrir-backend
npm install
npm run start:dev
```

3. Tekshirish:
   - API: http://localhost:3000/api/health
   - Swagger (barcha APIlarni brauzerda sinash): http://localhost:3000/docs
   - Postman: `postman/Tahrir-API.postman_collection.json`

### Demo hisoblar

| Rol   | Email           | Parol      |
|-------|-----------------|------------|
| Admin | admin@tahrir.uz | Admin1234! |
| User  | user@tahrir.uz  | User1234!  |

---

## 3. Javob formati (har doim shunday)

Muvaffaqiyat:

```json
{
  "success": true,
  "data": { },
  "meta": { "total": 10, "page": 1, "limit": 10, "totalPages": 1 }
}
```

- Ro'yxatlar: `data` — massiv, `meta` — sahifalash.
- Bitta obyekt: `data` — obyekt, `meta` yo'q bo'lishi mumkin.

Xato:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Parollar mos kelmadi",
  "errors": []
}
```

Muhim kodlar:

| Kod | Ma'nosi | Frontend nima qilsin |
|-----|---------|----------------------|
| 200 / 201 | OK | `data` ni chizish |
| 400 | Forma xato | `message` ni input ostida ko'rsatish |
| 401 | Token yo'q yoki eskirgan | logout, login sahifaga |
| 403 | Ruxsat yo'q (masalan, admin API) | "ruxsat yo'q" |
| 404 | Topilmadi | empty state |
| 409 | Email band | "bu email allaqachon bor" |

Sizning `api.js` da 401/403 bo'lsa `logout()` chaqiriladi — bu to'g'ri.

---

## 4. Autentifikatsiya — nima kerak

### Token qayerdan keladi

`POST /auth/login` yoki `POST /auth/register` javobidan:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "uuid",
      "fullName": "Ali",
      "email": "ali@mail.uz",
      "role": "user"
    }
  }
}
```

Saqlash (sizda allaqachon bor):

```js
localStorage.setItem("x-auth-token", data.token);
```

Har so'rovda:

```
Authorization: Bearer <token>
```

`Content-Type: application/json` — oddiy JSON uchun.  
Fayl yuklashda `multipart/form-data` (Postman/fetch FormData o'zi qo'yadi).

### Qaysi API ochiq, qaysi yopiq

**Token shart emas (public):**

- login, register, forgot/reset password
- blog, news, faq, plans — GET
- contact yuborish, newsletter
- grammatika tekshiruvi, rewrite, tahlil
- products/categories — GET
- health, stats

**Token shart (yopiq):**

- `GET /auth/me`, profilni o'zgartirish
- obuna olish, hujjat yuklash
- admin/manager: blog/news/faq yozish, userlar, contact ro'yxati

`role` qiymatlari: `admin` | `manager` | `user`

---

## 5. APIlar — nima uchun, qachon chaqirasiz

### Auth — kirish / chiqish

| Method | URL | Nima qiladi | Qachon |
|--------|-----|-------------|--------|
| POST | `/auth/register` | Yangi hisob ochadi, token qaytaradi | Register sahifa |
| POST | `/auth/login` | Kiradi, token qaytaradi | Login sahifa |
| GET | `/auth/me` | Hozirgi userni qaytaradi | Ilova ochilganda, header |
| POST | `/auth/forgot-password` | Parol tiklash so'raydi | "Parolni unutdingizmi" |
| POST | `/auth/reset-password` | Yangi parol qo'yadi | Email'dagi token bilan |

**Register body:**

```json
{
  "fullName": "Ism Familiya",
  "email": "ismingiz@mail.uz",
  "password": "kamida8",
  "confirmPassword": "kamida8"
}
```

**Login body:**

```json
{
  "email": "ismingiz@mail.uz",
  "password": "kamida8"
}
```

Login/Register hozir frontendda faqat `preventDefault` — shu ikkala API ni ulashingiz kerak. Muvaffaqiyatda token saqlang va `/` ga yo'naltiring.

---

### Users — profil va admin

| Method | URL | Nima qiladi |
|--------|-----|-------------|
| GET | `/users/me` | O'z profili |
| PATCH | `/users/me` | Ism yoki parolni yangilash |
| GET | `/users?page=1&limit=10&search=` | Barcha userlar (**admin**) |
| POST | `/users` | User yaratish (**admin**) |
| GET | `/users/:id` | Bitta user (**admin**) |
| PATCH | `/users/:id` | role / isActive (**admin**) |
| DELETE | `/users/:id` | O'chirish (**admin**) |

`PATCH /users/me` body: `{ "fullName": "...", "password": "..." }` (ikkalasi ixtiyoriy).

---

### Plans — narxlar sahifasi

| Method | URL | Nima qiladi |
|--------|-----|-------------|
| GET | `/plans` | Free / Plus / Pro / Team |
| GET | `/plans/:id` | Bitta tarif |
| POST/PATCH/DELETE | `/plans` | Tarif CRUD (**admin**) |

Pricing sahifasidagi qattiq yozilgan `PLANS` massivini shu `GET /plans` bilan almashtirish mumkin.

Har tarifda: `name`, `description`, `monthlyPrice`, `yearlyPrice`, `features[]`, `cta`, `isPopular`, `documentsPerMonth`.

Yillik narx backendda 20% chegirma bilan hisoblangan (`yearlyPrice`). Frontendda `monthly * 0.8` qayta hisoblash shart emas — `yearlyPrice` ni ishlating yoki oylikni ko'rsatib qoling.

---

### Subscriptions — tarifni tanlash

| Method | URL | Nima qiladi |
|--------|-----|-------------|
| POST | `/subscriptions` | Foydalanuvchini tarifga ulaydi |
| GET | `/subscriptions/me` | Mening obunalarim |
| PATCH | `/subscriptions/:id/cancel` | Bekor qilish |

Body:

```json
{
  "planId": "uuid",
  "billingPeriod": "monthly"
}
```

`billingPeriod`: `monthly` | `yearly`

Pricingdagi "Tanlash" / "Boshlash" tugmasi shu APIga ulanadi. Token bo'lmasa — avval login.

---

### Contact — aloqa formasi

| Method | URL | Nima qiladi |
|--------|-----|-------------|
| POST | `/contact` | Murojaat yuboradi (token shart emas) |
| GET | `/contact` | Barcha murojaatlar (**admin/manager**) |
| GET | `/contact/:id` | Bitta |
| PATCH | `/contact/:id` | status: `new` \| `read` \| `replied` |
| DELETE | `/contact/:id` | O'chirish (**admin**) |

Body:

```json
{
  "fullName": "Ali Valiyev",
  "email": "ali@mail.uz",
  "phone": "+998901234567",
  "message": "Savol matni"
}
```

Contact sahifasi hozir bo'sh — formani shu POST ga ulang. Footer "yordam" ham shu yoki alohida.

Frontendda `useCreateContactMutation` allaqachon bor.

---

### Newsletter — footer email

| Method | URL | Nima qiladi |
|--------|-----|-------------|
| POST | `/newsletter` | Emailga obuna |
| GET | `/newsletter` | Ro'yxat (**admin**) |

Body: `{ "email": "news@mail.uz" }`

Footer formasi hozir `preventDefault` — shu POST ni ulash kifoya.

---

### Blog — blog sahifasi

| Method | URL | Nima qiladi |
|--------|-----|-------------|
| GET | `/blog/categories` | Writing tips, Grammar, ... |
| GET | `/blog?page=1&limit=10&search=&category=` | Maqolalar |
| GET | `/blog/:id` | Bitta maqola (id yoki slug) |
| POST | `/blog/categories` | Kategoriya (**admin**) |
| POST | `/blog` | Maqola yozish (**admin**) |
| PATCH | `/blog/:id` | Tahrirlash |
| DELETE | `/blog/:id` | O'chirish |

Query:

- `search` — sarlavha/matn qidiruv
- `category` — kategoriya nomi yoki slug. `All articles` yuborsangiz, filter yo'q
- `featured=true` — featured maqolalar

Blogdagi qattiq `ARTICLES` / `CATEGORIES` ni shu APIlar bilan almashtiring.

---

### News — yangiliklar sahifasi

| Method | URL | Nima qiladi |
|--------|-----|-------------|
| GET | `/news?page=1&limit=10&search=` | Ro'yxat |
| GET | `/news/:id` | Bitta (id yoki slug) |
| POST/PATCH/DELETE | `/news` | CRUD (**admin**) |

News sahifasi hozir faqat "News" yozuvi — shu GET ni ulash kifoya.

---

### FAQ / Help

| Method | URL | Nima qiladi |
|--------|-----|-------------|
| GET | `/faq/topics` | Boshlash, Hujjatlar, Tariflar... |
| GET | `/faq?tab=popular&search=&topic=` | Savol-javob |
| POST | `/faq/topics` | Mavzu (**admin**) |
| POST | `/faq` | Savol (**admin**) |
| DELETE | `/faq/:id` | O'chirish |

`tab`: `popular` | `guides` | `trouble`  
Help sahifasidagi `FAQS` / `TOPICS` ni shu bilan almashtirish mumkin.  
Bosh sahifa Faq komponenti ham `GET /faq` dan olishi mumkin.

---

### Grammatika, rewrite, tahlil — Opportunities / editor

Frontend `GrammarEditor` hozir brauzerda tekshiradi. Serverga ulamoqchi bo'lsangiz:

**Tekshirish** — `POST /grammar/check`

```json
{ "text": "xizmat korsatadi" }
```

Javobdagi `issues` massivi editor kutgan formatda:

```json
{
  "start": 7,
  "end": 16,
  "suggestion": "ko'rsatadi",
  "message": "To'g'ri yozilishi: «ko'rsatadi».",
  "type": "spelling"
}
```

`type`: `spelling` | `punct` | `style`  
Token bo'lsa, tarix saqlanadi. Token bo'lmasa ham ishlaydi.

**Tarix** — `GET /grammar/history` (token kerak)

**Qayta yozish** — `POST /rewrite`

```json
{
  "text": "Loyiha biz uchun juda muhim edi.",
  "style": "formal"
}
```

`style`: `simpler` | `formal` | `shorter` | `detailed`  
Opportunitiesdagi "AI yordamida qayta yozish" shu.

**Tahlil** — `POST /analysis`

```json
{ "text": "..." }
```

Javob: `grammar`, `clarity`, `tone`, `readability`, `words`, `chars` — Opportunitiesdagi statistika kartasi shu.

---

### Documents — hujjat yuklash

| Method | URL | Nima qiladi |
|--------|-----|-------------|
| POST | `/documents` | Fayl yuklash (token kerak) |
| GET | `/documents` | Mening fayllarim |
| GET | `/documents/:id` | Bitta |
| GET | `/documents/:id/download` | Yuklab olish (fayl oqimi, JSON emas) |
| DELETE | `/documents/:id` | O'chirish |

Yuklash: `FormData`, maydon nomi **`file`**. Max ~20MB.

```js
const form = new FormData();
form.append("file", selectedFile);
await fetch(BASE + "documents", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: form,
});
```

Bu yerda `Content-Type` ni qo'lda yozmang.

---

### Products / Categories

Frontendda `productApi` va `categoryApi` bor (eski loyihadan). Backend mos:

| Method | URL |
|--------|-----|
| GET | `/products?page=1&limit=10&search=&categoryId=` |
| GET | `/products/search?search=` |
| GET | `/products/part/search?search=` |
| GET | `/products/:id` |
| POST | `/products` |
| PUT | `/products/:id` |
| DELETE | `/products/:id` |
| GET | `/categories` |
| GET | `/categories/:id` |
| POST | `/categories` |
| PUT | `/categories/:id` |
| DELETE | `/categories/:id` |

Yozish/o'chirish — admin/manager. Tahrir saytining asosiy sahifalari bularsiz ham ishlaydi.

---

### Health / Stats

| Method | URL | Nima qiladi |
|--------|-----|-------------|
| GET | `/health` | Server tirikmi |
| GET | `/stats` | Bosh sahifa raqamlari (public) |

---

## 6. Frontendda qaysi sahifaga qaysi API

| Sahifa / qism | API | Holat |
|---------------|-----|--------|
| Login | `POST /auth/login` | ulash kerak |
| Register | `POST /auth/register` | ulash kerak |
| Header (hisob) | `GET /auth/me` | ulash kerak |
| Pricing | `GET /plans` | hardcoded bor, API ga o'tkazish mumkin |
| Pricing tugma | `POST /subscriptions` | ulash kerak |
| Contact | `POST /contact` | mutation bor, sahifa bo'sh |
| Footer email | `POST /newsletter` | ulash kerak |
| Blog | `GET /blog`, `GET /blog/categories` | hardcoded, API ga o'tkazish mumkin |
| News | `GET /news` | sahifa bo'sh |
| Help | `GET /faq`, `GET /faq/topics` | hardcoded, API ga o'tkazish mumkin |
| Home FAQ | `GET /faq` | hardcoded |
| Grammar editor | `POST /grammar/check` | hozir brauzerda, ixtiyoriy |
| Rewrite demo | `POST /rewrite` | ixtiyoriy |
| Tahlil kartasi | `POST /analysis` | ixtiyoriy |
| Hujjat yuklash | `POST /documents` | token bilan |

---

## 7. RTK Query ga qanday qo'shiladi

Sizda `src/services/api.js` bor. Yangi endpoint shu yerga inject qilinadi.

Misol — login:

```js
// src/services/authApi.js
import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    register: build.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    me: build.query({
      query: () => "/auth/me",
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useMeQuery } = authApi;
```

Login sahifada:

```js
const [login, { isLoading, error }] = useLoginMutation();

const onSubmit = async (e) => {
  e.preventDefault();
  const res = await login({ email, password }).unwrap();
  dispatch(setToken(res.data.token)); // interceptor { success, data } qaytaradi
  navigate("/");
};
```

**E'tibor:** javob `res.data.token` (chunki backend `{ success, data: { token, user } }` qaytaradi). RTK esa o'zi ham `data` ichiga o'raydi — tekshirib oling:

- `unwrap()` dan keyin ko'pincha: `result.data.token` yoki `result.token`
- Brauzer Network tabda real JSON ni qarang

To'g'ri yo'l: `const payload = await login(body).unwrap();` keyin `payload.data.token`.

---

## 8. Postman

1. `postman/Tahrir-API.postman_collection.json` ni import qiling.
2. `postman/Tahrir-API.postman_environment.json` ni import qiling, environment ni **Tahrir Local** qiling.
3. Avval **Auth → Login (admin)** ni yuboring — `token` o'zi yoziladi.
4. Keyin yopiq APIlarni sinang.

Swagger ham qulay: http://localhost:3000/docs → Authorize → `Bearer <token>`.

---

## 9. Qisqa xulosa frontendchi uchun

1. Base: `http://localhost:3000/api`
2. JSON yuborasiz, JSON olasiz: `{ success, data, meta? }`
3. Login/register dan `data.token` ni olib `x-auth-token` ga saqlaysiz
4. Keyin `Authorization: Bearer ...`
5. 401 bo'lsa logout
6. Avval login, blog, plans, contact, faq ni ulash yetarli — qolgani keyin

Savol bo'lsa: backend ishlayotganini `/api/health` bilan tekshiring. `success: true` bo'lmasa, PostgreSQL yoki `npm run start:dev` ishlamayapti.
