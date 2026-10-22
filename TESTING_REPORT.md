# Little Things Archive — Backend Testing Report

## 1. Tujuan Pengujian

Pengujian ini dilakukan untuk memastikan backend API Little Things Archive dapat menangani request valid dan tidak valid, mengembalikan HTTP status yang sesuai, mencatat request, serta menyimpan data ke PostgreSQL.

## 2. Lingkungan Pengujian

- **Backend:** Flask
- **Database:** PostgreSQL
- **Database runtime:** Docker Compose
- **API testing tool:** PowerShell `Invoke-RestMethod`
- **Local API URL:** `http://127.0.0.1:5000`
- **Git branch:** `backend-api`

## 3. Hasil Pengujian

| ID | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-01 | Membuat memory dengan data valid | HTTP 201 dan data memory dikembalikan | HTTP 201, memory berhasil dibuat dengan ID 3 dan data dikembalikan | PASS |
| TC-02 | Mengirim judul kosong | HTTP 400 dan pesan validasi | HTTP 400, `Judul wajib diisi` | PASS |
| TC-03 | Mengirim happiness level 6 | HTTP 400 dan pesan validasi skor | HTTP 400, skor harus 1–5 | PASS |
| TC-04 | Mengirim tanggal `2026-02-30` | HTTP 400 dan pesan tanggal tidak valid | HTTP 400, `Tanggal tidak valid` | PASS |
| TC-05 | Mengirim kategori `travel` | HTTP 400 dan pesan kategori tidak valid | HTTP 400, `Kategori tidak valid` | PASS |
| TC-06 | Mengirim JSON tidak valid | HTTP 400 dan pesan validasi body | HTTP 400, `Body harus berupa JSON object` | PASS |
| TC-07 | Mengambil memory yang tidak ditemukan | HTTP 404 | `Memory tidak ditemukan` | PASS |
| TC-08 | Menghapus memory ID 2 | HTTP 200 dan data yang dihapus dikembalikan | HTTP 200, data memory yang dihapus berhasil dikembalikan | PASS |
| TC-09 | Mengambil memory ID 2 setelah dihapus | HTTP 404 | `Memory tidak ditemukan` | PASS |
| TC-10 | Memeriksa healthcheck | HTTP 200 dan database terhubung | Status `ok`, database `connected` | PASS |
| TC-11 | Memeriksa request logging | Request tercatat di terminal Flask | Log POST dan GET terlihat | PASS |
| TC-12 | Membaca kembali memory yang dibuat | Data yang sama dikembalikan | Memory ID 3 berhasil diambil melalui GET | PASS |
| TC-13 | Memeriksa data di PostgreSQL | Data ditemukan dalam tabel `memories` | ID 3 ditemukan melalui query SELECT | PASS |
| TC-14 | Memeriksa persistensi setelah restart Flask | Data tetap tersedia setelah Flask dijalankan kembali| Memory ID 3 tberhasil diambil kembali melalui GET setelah restart Flask | PASS |

## 4. Contoh Respons Pengujian

### A. Validasi judul kosong

HTTP status: `400 Bad Request`

```json
{
  "details": {
    "title": "Judul wajib diisi"
  },
  "error": "Validasi gagal"
}
```

### B. Memory tidak ditemukan

HTTP status: `404 Not Found`

```json
{
  "error": "Memory tidak ditemukan"
}
```

### C. Healthcheck berhasil

HTTP status: `200 OK`

```json
{
  "status": "ok",
  "service": "little-things-archive-api",
  "database": "connected"
}
```

## 5. Logging dan Error Handling

Backend mencatat method dan path request melalui logging Flask. Request yang gagal karena validasi juga tercatat di terminal dengan HTTP status yang sesuai.

Respons validasi memberikan pesan yang relevan kepada client, tanpa menampilkan traceback Python atau detail koneksi database pada respons yang diuji.

## 6. Kesimpulan

Berdasarkan skenario yang telah diuji, endpoint utama, validasi input, error response, request logging, dan persistensi data PostgreSQL menunjukkan hasil sesuai ekspektasi.

Pengujian integrasi dengan frontend masih perlu dilakukan bersama anggota tim frontend. Pengujian tambahan untuk kegagalan koneksi database dan skenario lainnya dapat dilakukan jika diperlukan.

## 7. Catatan

Status PASS berlaku untuk skenario pengujian yang tercantum dalam laporan ini. Hasil tersebut tidak berarti seluruh kemungkinan input dan kondisi kegagalan telah diuji.