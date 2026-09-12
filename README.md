# Marketplace Mobile Center — Console (Dashboard Vendeur/Admin)

Console web React مبنية للاتصال مباشرة بـ API ديال Laravel.

## ⚙️ التثبيت

```bash
npm install
```

## 🔗 قبل ما تشغل: فعّل CORS فـ Laravel

باش Laravel يقبل الطلبات الجايين من هاد الـ Dashboard (`http://localhost:5173`)، تأكد من `config/cors.php`:

```php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_headers' => ['*'],
'supports_credentials' => false,
```

إلا الملف ماكاينش، نفّذ فمشروع Laravel:
```bash
composer require fruitcake/laravel-cors
```
(احتمال already مثبت، شفنا `fruitcake/laravel-cors` فالـ composer.json من قبل).

## ▶️ تشغيل

تأكد `php artisan serve` خدام فـ `http://127.0.0.1:8000` (المسار مضبوط فـ `src/api.js`)، منبعد:

```bash
npm run dev
```

الـ Dashboard غادي يخدم فـ `http://localhost:5173`.

## 👤 تسجيل الدخول

استعمل حساب `vendeur` ولا `super_admin` موجود فـ DB (بحال `admin@test.com` اللي زدناه بـ Seeder). حسابات `visiteur` ماعندهمش وصول لهاد الـ Console (مخصصة للتطبيق Mobile).

## 📁 بنية المشروع

```
src/
├── api.js                 # axios + token interceptor
├── context/AuthContext.jsx
├── components/
│   ├── Layout.jsx          # sidebar + shell عام
│   ├── Modal.jsx
│   └── StatusTag.jsx
└── pages/
    ├── Login.jsx
    ├── DashboardHome.jsx
    ├── Boutique.jsx         # vendeur: إدارة البوتيك ديالو
    ├── Produits.jsx         # vendeur: CRUD منتجات
    ├── Demandes.jsx         # vendeur: قبول/رفض طلبات
    ├── Horaires.jsx         # vendeur: أوقات العمل
    ├── BoutiquesAdmin.jsx   # admin: كل البوتيكات
    └── Signalements.jsx     # admin: معالجة البلاغات
```

## 🎨 هوية التصميم

خلفية داكنة (`#14161A`) قريبة من لوحة دارات إلكترونية، لون نحاسي (`#C97A3D`) كـ accent رئيسي، وخط `JetBrains Mono` للأرقام (أسعار، مخزون) — مستوحى من طبيعة المشروع (متجر هواتف وقطع غيار).

## ⏭️ خطوات مقترحة لاحقاً

- صفحة Categories (admin) — إدارة التصنيفات الهرمية
- رفع صور المنتجات (endpoint `/images-produits` جاهز فـ backend)
- صفحة Journaux Audit (admin) — عرض السجلات
- Pagination حقيقية (الـ backend كايرجع `meta`/`links` جاهزين)
