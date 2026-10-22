# little-things-archive
# Little Things Archive

Little Things Archive adalah aplikasi web untuk menyimpan kenangan kecil yang bermakna. Pengguna dapat menambahkan, melihat, mencari, dan memfilter kenangan. Fitur edit dan hapus dilindungi dengan PIN Admin.

## Teknologi yang Digunakan

- **Frontend:** HTML, CSS, JavaScript
- **Web server / reverse proxy:** Nginx
- **Backend:** Python dan Flask
- **Database:** PostgreSQL 16
- **Database access:** SQLAlchemy dan driver PostgreSQL sesuai konfigurasi backend
- **Containerization:** Docker dan Docker Compose

## Fitur Aplikasi

- CRUD (Create, Read, Update, Delete) kenangan.
- Pencarian kenangan berdasarkan judul.
- Filter berdasarkan kategori.
- Validasi input dan penanganan error.
- Proteksi PIN Admin untuk operasi edit dan delete.
- Penyimpanan data menggunakan PostgreSQL.
- Persistent storage melalui Docker volume.
- Healthcheck database menggunakan `pg_isready`.

## Arsitektur Sistem

Alur komunikasi aplikasi:

1. Pengguna berinteraksi dengan frontend melalui browser.
2. Nginx menyajikan file frontend dan meneruskan request `/api/` ke Flask API.
3. Flask memproses request, melakukan validasi, dan menjalankan operasi database.
4. PostgreSQL menyimpan dan menyediakan data kenangan.
5. Backend mengirim HTTP response kepada frontend.

Aplikasi dijalankan menggunakan Docker Compose dengan service frontend, backend, dan database.

## Struktur Project

```text
little-things-archive/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── Dockerfile
│   └── nginx.conf
├── compose.yaml
├── .env.example
├── .gitignore
└── README.md
```

## Persyaratan

Pastikan perangkat sudah memiliki:

- Docker Desktop atau Docker Engine.
- Docker Compose.
- Git jika repository ingin diunduh melalui Git.

## Konfigurasi Environment

Buat file `.env` di direktori utama berdasarkan `.env.example`.

Contoh variabel yang diperlukan:

```dotenv
POSTGRES_USER=your_database_user
POSTGRES_PASSWORD=your_database_password
POSTGRES_DB=little_things_archive
ADMIN_PIN=your_admin_pin
```

Sesuaikan nilai variabel dengan konfigurasi project. Gunakan nilai yang sesuai dengan environment lokal.

**Penting:** `.env` berisi konfigurasi lokal dan rahasia sehingga tidak boleh diunggah ke repository. Repository hanya menyertakan `.env.example` dengan nilai contoh, bukan password atau PIN asli.

## Cara Menjalankan Aplikasi

1. Clone repository:

```bash
git clone https://github.com/Clarisse-X/little-things-archive.git
```

2. Masuk ke direktori project:

```bash
cd little-things-archive
```

3. Buat file `.env` berdasarkan `.env.example`, lalu sesuaikan konfigurasi.

4. Validasi konfigurasi Docker Compose:

```bash
docker compose config --quiet
```

5. Build image dan jalankan seluruh service:

```bash
docker compose up -d --build
```

6. Periksa status container:

```bash
docker compose ps
```

Database diharapkan menunjukkan status `healthy`, sedangkan frontend dan backend harus berjalan.

7. Buka aplikasi melalui browser:

```text
http://localhost:8080
```

Endpoint health backend yang tersedia:

```text
http://localhost:8080/health
```

## API Documentation

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/memories` | Mengambil daftar kenangan |
| POST | `/api/memories` | Menambahkan kenangan |
| PUT | `/api/memories/{id}` | Memperbarui kenangan berdasarkan ID |
| DELETE | `/api/memories/{id}` | Menghapus kenangan berdasarkan ID |
| POST | `/api/verify-pin` | Memverifikasi PIN Admin |

### Membaca Kenangan

```http
GET /api/memories
```

Endpoint ini mengembalikan daftar kenangan. Parameter pencarian `search` dan filter `category` dapat digunakan sesuai implementasi API.

Contoh:

```http
GET /api/memories?search=presentasi
```

### Menambahkan Kenangan

```http
POST /api/memories
Content-Type: application/json
```

Contoh request body:

```json
{
  "title": "Hari Presentasi",
  "story": "Akhirnya presentasi selesai!",
  "memory_date": "2026-10-22",
  "category": "achievement",
  "happiness_level": 5
}
```

### Memperbarui Kenangan

```http
PUT /api/memories/7
Content-Type: application/json
X-Admin-PIN: <PIN_ADMIN>
```

Request body berisi data kenangan yang ingin diperbarui. Backend memeriksa PIN Admin sebelum menjalankan operasi.

### Menghapus Kenangan

```http
DELETE /api/memories/7
X-Admin-PIN: <PIN_ADMIN>
```

Backend menolak request jika PIN tidak tersedia atau tidak valid.

### Memverifikasi PIN Admin

```http
POST /api/verify-pin
Content-Type: application/json
```

Contoh request body:

```json
{
  "pin": "<PIN_ADMIN>"
}
```

PIN harus sesuai dengan nilai `ADMIN_PIN` yang dikonfigurasi pada environment backend.

## Validasi dan Error Handling

Backend memvalidasi data yang dikirim pengguna, termasuk judul, cerita, tanggal, kategori, dan tingkat kebahagiaan.

HTTP status code yang relevan:

| Status | Keterangan |
|---|---|
| 200 | Request berhasil |
| 400 | Request atau input tidak valid |
| 401 | PIN Admin tidak ada atau salah |
| 404 | Endpoint atau resource tidak ditemukan, sesuai implementasi |

Frontend menampilkan pesan kesalahan berdasarkan respons API agar pengguna mengetahui apabila suatu operasi gagal.

## Pengujian Backend dan Database

Pengujian dilakukan melalui browser dan PowerShell.

Pengujian yang sudah dilakukan:

1. Mengambil daftar kenangan melalui `GET /api/memories`.
2. Memverifikasi PIN yang benar dan memastikan endpoint mengembalikan HTTP 200.
3. Memastikan PIN yang salah ditolak dengan HTTP 401.
4. Memastikan request edit tanpa PIN ditolak dengan HTTP 401.
5. Memastikan request delete tanpa PIN ditolak dengan HTTP 401.
6. Menguji edit dan delete melalui website menggunakan PIN yang benar.
7. Memastikan data tetap tersedia setelah restart container pada pengujian persistensi.

### Contoh Pengujian PIN Salah

```powershell
try {
    Invoke-RestMethod -Method Post `
      -Uri "http://localhost:8080/api/verify-pin" `
      -ContentType "application/json" `
      -Body '{"pin":"9999"}'
} catch {
    Write-Host "HTTP Status:" ([int]$_.Exception.Response.StatusCode)
}
```

Hasil yang diharapkan adalah HTTP 401 jika PIN tersebut bukan PIN yang dikonfigurasi.

### Memeriksa Log

```bash
docker compose logs --tail 50 backend
```

Untuk memeriksa log database:

```bash
docker compose logs --tail 50 db
```

### Menguji Persistensi

1. Pastikan terdapat data kenangan di database.
2. Restart container tanpa menghapus volume:

```bash
docker compose restart
```

3. Buka kembali aplikasi dan periksa daftar kenangan.

Data seharusnya tetap tersedia jika persistent volume yang sama digunakan dan tidak dihapus.

## Menghentikan Aplikasi

```bash
docker compose down
```

Perintah tersebut menghentikan dan menghapus container project, tetapi secara default tidak menghapus named volume database.

**Hindari `docker compose down -v` jika data database masih diperlukan**, karena opsi tersebut dapat menghapus volume.

## Tim Pengembang

Pembagian kontribusi kelompok disesuaikan dengan pekerjaan yang benar-benar dikerjakan setiap anggota.

- **Balqis Keyla Ghassani — Frontend:** pengembangan antarmuka dan interaksi pengguna.
- **Raden Zahra Auliya Marissa Solihin — Backend & Database:** implementasi Flask API, endpoint CRUD, validasi request, integrasi PostgreSQL, proteksi PIN Admin, dan pengujian backend.
- **Clarisse Xaviera Kurniaman — Docker & Integrasi:** konfigurasi Docker, integrasi service, pengujian sistem, dan deployment sesuai pembagian tugas kelompok.

## Repository

GitHub: https://github.com/Clarisse-X/little-things-archive
