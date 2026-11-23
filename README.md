# O'quv Markazi ERP / CRM (2-Bosqich — To'liq Supabase)

Loyiha to'liq **Supabase bulutli bazasiga** o'tkazildi, barcha eski backend kodlari va vaqtinchalik (mock) ma'lumotlar olib tashlandi. Tizim to'liq **O'zbek tilida**, minimalist va tushunarli interfeysda ishlaydi.

---

## 🌐 Mustaqil Ilovalar va Portlar

| Ilova | Domen / Subdomen | Vazifasi | Mahalliy Port |
| :--- | :--- | :--- | :--- |
| **`landing/`** | `sayt.uz` | **Asosiy portal:** O'quv markaz haqida ma'lumot, kurslar va Supabase `leads` jadvaliga tushadigan online qabul formasi. | 👉 [http://localhost:3000](http://localhost:3000) |
| **`admin/`** | `admin.sayt.uz` | **Admin ERP/CRM (1 va 2-bosqich):** O'quvchilar, Guruhlar, Kurslar, O'qituvchilar, **Kunlik Davomat**, **To'lovlar & Qarzdorlar ro'yxati** va **Online arizalar (Lidlar)**. | 👉 [http://localhost:3001](http://localhost:3001) |
| **`director/`** | `direktor.sayt.uz` | **Direktor Kabineti:** Supabase Auth orqali kirish, **Adminlarni boshqarish** (yangi admin qo'shish va o'chirish) hamda umumiy statistika monitoringi. | 👉 [http://localhost:3002](http://localhost:3002) |

---

## 🚀 2-Bosqichda Amalga Oshirilgan Yangi Funksiyalar:

### 1. Direktor Paneli (`director/`): Adminlarni Boshqarish
- **Supabase Auth orqali kirish:** Direktor o'z emaili va paroli bilan kabinetga kiradi.
- **Adminlar bo'limi:**
  - Yangi admin qo'shish (Ism, Email, Parol).
  - Yangi admin yaratilganda (`signUp`), **direktorning o'z sessiyasi buzilmasligi uchun** `persistSession: false` qilingan vaqtinchalik Supabase mijozi orqali ro'yxatdan o'tkaziladi va `profiles` jadvaliga `role: 'admin'` qilib saqlanadi.
  - Barcha mavjud adminlar ro'yxatini ko'rish va tizimdan o'chirish imkoniyati.

### 2. Admin Paneli (`admin/`): Davomat va To'lovlar
- **Kunlik Davomat (`attendance` jadvali):**
  - Guruh va sana (default: bugungi kun) tanlanadi.
  - Guruhga biriktirilgan barcha o'quvchilar ro'yxati chiqadi.
  - Har bir o'quvchi uchun **"Keldi"** (yashil) va **"Kelmadi"** (qizil) tugmalari.
  - "Davomatni saqlash" tugmasi bosilganda real `attendance` jadvaliga yoziladi (agar shu sana uchun oldin belgilangan bo'lsa, avtomatik `upsert` bo'ladi).
- **To'lovlar & Kassa (`payments` jadvali):**
  - Yangi to'lov qabul qilish: O'quvchini tanlash, to'lov summasi, to'lov sanasi, qaysi oy uchunligi (masalan: `2026-11`) va izoh.
  - To'lovlar tarixi jadvali (oy bo'yicha saralash/filter bilan).
- **Qarzdorlar Ro'yxati (Debtors):**
  - Tanlangan oy uchun har bir o'quvchining a'zo bo'lgan guruhlari va ularning oylik kurs narxlari hisoblanadi.
  - Shu oyda o'quvchi to'lagan to'lovlar summasi ayirilib, to'liq to'lamagan o'quvchilar **alohida Qarzdorlar jadvalida** qizil rangda (`-Qarzdorlik miqdori`) ko'rsatiladi.
  - Har bir qarzdor yonida bir bosishda **"To'lov qabul qilish"** tezkor tugmasi mavjud.
- **Online Arizalar (Lidlar):**
  - `landing` sahifasidagi arizalar to'g'ridan-to'g'ri admin panelidagi "Lidlar" bo'limiga tushadi va statusini o'zgartirish mumkin.

---

## 🗄 Supabase Baza Sxemasi (SQL Editor)

Ildizdagi [`supabase_schema.sql`](./supabase_schema.sql) faylini Supabase Dashboardingizning **SQL Editor** bo'limiga tashlab **"RUN"** tugmasini bosing:
- `profiles` — Direktor va Adminlar roli (`director`, `admin`)
- `teachers` — O'qituvchilar
- `courses` — Kurslar va narxlar
- `groups` — Guruhlar va dars vaqtlari
- `students` — O'quvchilar va telefonlar
- `enrollments` — O'quvchilarni guruhga biriktirish
- `attendance` — Kunlik davomat jurnali
- `payments` — To'lovlar tarixi
- `leads` — Online arizalar
- Xavfsiz RPC funksiya (`delete_user_by_admin`) va RLS siyosatlari.

---

## ⚡️ Alohida Ishga Tushirish Buyruqlari:

```bash
# 1. Asosiy Sayt (sayt.uz)
cd landing && npm run dev          # http://localhost:3000

# 2. Admin ERP / CRM (admin.sayt.uz)
cd admin && npm run dev            # http://localhost:3001

# 3. Direktor Kabineti (direktor.sayt.uz)
cd director && npm run dev         # http://localhost:3002
```
