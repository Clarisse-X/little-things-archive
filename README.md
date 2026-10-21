# 🌸 Little Things Archive

> Tempat menyimpan momen-momen kecil yang bikin bahagia.

Aplikasi web sederhana untuk mencatat, mengelola, dan mengarsipkan kenangan kecil sehari-hari. Proyek ini dikembangkan sebagai bagian dari tugas kolaboratif untuk menguji integrasi *Full-Stack* menggunakan kontainerisasi Docker.


## 🚀 Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Python (Flask), RESTful API
- **Database:** PostgreSQL (dengan *Persistent Volume*)
- **Containerization:** Docker & Docker Compose
- **Web Server / Reverse Proxy:** Nginx


## 📂 Struktur Proyek

```text
little-things-archive/
├── backend/
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/ (HTML, CSS, JS)
├── compose.yaml
├── .env.example
└── README.md
```

## ⚙️ Cara Menjalankan Proyek (Setup & Installation)

Pastikan komputer/laptop kamu sudah terinstal Docker dan Docker Compose.

1. **Clone repository ini:**

    ```markdown
    git clone [https://github.com/username/little-things-archive.git](https://github.com/username/little-things-archive.git)
    cd little-things-archive
    ```

2. **Salin file .env.example menjadi .env lalu sesuaikan konfigurasi database jika diperlukan:**

    ```markdown
    cp .env.example .env
    ```

3. **Build dan jalankan aplikasi menggunakan Docker Compose:**

    ```markdown
    docker compose up --build -d
    ```

4. **Akses aplikasi melalui browser di alamat:** http://localhost:8080


## 🧪 Panduan Pengujian (Testing)

1. **Tes Endpoint Healthcheck:**
    
    Buka http://localhost:5000/health atau melalui API client untuk memastikan backend berjalan normal.

2. **Tes Fitur CRUD:**

    * Tambah kenangan baru melalui form di halaman utama.
    * Lihat daftar kenangan pada galeri.
    * Ubah atau hapus kenangan menggunakan tombol interaktif pada kartu.

3. **Uji Persistensi Database:**

    * Tambahkan sebuah kenangan.
    * Matikan kontainer dengan perintah: docker compose down.
    * Nyalakan kembali: docker compose up -d.
    * Refresh halaman web; pastikan data kenangan tidak hilang berkat persistent volume PostgreSQL.


## 👥 Tim Pengembang
- Balqis Keyla Ghassani  — UI/UX & Frontend Development
- Raden Zahra Auliya Marissa Solihin — Backend & API Logic
- Clarisse Xaviera Kurniaman — Database, Docker & Integration 