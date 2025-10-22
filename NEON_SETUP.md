# Neon Database Setup Guide

Panduan lengkap untuk mengatur database PostgreSQL di Neon untuk proyek IT Literature Shop API.

## 🚀 Langkah-langkah Setup

### 1. Buat Akun Neon
1. Kunjungi [neon.tech](https://neon.tech)
2. Daftar akun baru atau login
3. Buat project baru

### 2. Dapatkan Connection String
1. Di dashboard Neon, pilih project Anda
2. Pergi ke tab "Connection Details"
3. Copy connection string yang tersedia
4. Format connection string:
   ```
   postgresql://username:password@ep-xxxxx-xxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Setup Environment Variables
1. Copy file `env.example` menjadi `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit file `.env` dan isi dengan data dari Neon:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxxxx-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://username:password@ep-xxxxx-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

### 4. Jalankan Database Setup
Ada beberapa cara untuk setup database:

#### Opsi A: Menggunakan Prisma Migrate (Recommended)
```bash
# Generate Prisma client
npm run db:generate

# Jalankan migrasi
npm run db:migrate
```

#### Opsi B: Menggunakan SQL Script Langsung
1. Buka Neon SQL Editor di dashboard
2. Copy dan paste isi file `database-setup.sql`
3. Jalankan script tersebut

#### Opsi C: Menggunakan psql Command Line
```bash
# Install psql jika belum ada
# Ubuntu/Debian: sudo apt-get install postgresql-client
# macOS: brew install postgresql

# Jalankan script
psql "your-connection-string" -f database-setup.sql
```

### 5. Verifikasi Setup
```bash
# Test koneksi database
npm run db:studio

# Atau jalankan aplikasi
npm run dev
```

## 📊 Struktur Database

Database terdiri dari 5 tabel utama:

### 1. **users** - Data pengguna
- `id` (UUID, Primary Key)
- `username` (String, Optional)
- `password` (String, Required)
- `email` (String, Unique)
- `created_at`, `updated_at` (Timestamp)

### 2. **genres** - Kategori buku
- `id` (UUID, Primary Key)
- `name` (String, Unique)
- `created_at`, `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Optional - Soft Delete)

### 3. **books** - Data buku
- `id` (UUID, Primary Key)
- `title` (String, Unique)
- `writer` (String)
- `publisher` (String)
- `publication_year` (Integer)
- `description` (String, Optional)
- `price` (Decimal 10,2)
- `stock_quantity` (Integer)
- `genre_id` (UUID, Foreign Key ke genres)
- `created_at`, `updated_at` (Timestamp)
- `deleted_at` (Timestamp, Optional - Soft Delete)

### 4. **orders** - Data pesanan
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key ke users)
- `total` (Decimal 10,2)
- `created_at`, `updated_at` (Timestamp)

### 5. **order_items** - Item dalam pesanan
- `id` (UUID, Primary Key)
- `quantity` (Integer)
- `order_id` (UUID, Foreign Key ke orders)
- `book_id` (UUID, Foreign Key ke books)
- `created_at`, `updated_at` (Timestamp)

## 🔧 Fitur Database

### Indexes untuk Performance
- Unique indexes pada email, genre name, dan book title
- Performance indexes pada foreign keys dan kolom yang sering di-query
- Indexes untuk soft delete (deleted_at)

### Triggers
- Auto-update `updated_at` timestamp pada semua tabel

### Views
- `books_with_genre` - View gabungan books dan genres
- `order_summary` - View ringkasan pesanan

### Sample Data
Script sudah include sample data untuk testing:
- 5 sample genres (Programming, Web Development, Data Science, dll)
- 5 sample books dengan berbagai genre

## 🛠️ Troubleshooting

### Error: "relation does not exist"
```bash
# Pastikan migrasi sudah dijalankan
npm run db:migrate

# Atau jalankan ulang setup script
```

### Error: "connection refused"
- Periksa connection string di `.env`
- Pastikan database Neon sudah aktif
- Cek firewall/network settings

### Error: "permission denied"
- Pastikan user memiliki permission yang cukup
- Cek role dan privileges di Neon dashboard

### Error: "SSL required"
- Pastikan `sslmode=require` ada di connection string
- Neon memerlukan SSL connection

## 📝 Tips Penggunaan

1. **Connection Pooling**: Neon mendukung connection pooling, gunakan parameter `pgbouncer=true` jika diperlukan
2. **Monitoring**: Gunakan Neon dashboard untuk monitor performance dan usage
3. **Backup**: Neon otomatis backup data, tapi tetap buat backup manual untuk data penting
4. **Scaling**: Neon bisa auto-scale berdasarkan usage

## 🔗 Link Berguna

- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📞 Support

Jika mengalami masalah:
1. Cek log error di console
2. Periksa Neon dashboard untuk status database
3. Pastikan semua environment variables sudah benar
4. Coba restart aplikasi dan database connection
