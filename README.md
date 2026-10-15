# Form Hitung Box — Mitra Perkasa Kemasindo

Program estimasi harga box (dus atas dan bawah), dibuat dari file `FORM_HITUNG_BOX.xlsx`.

## Isi repo

| File | Fungsi |
|---|---|
| `index.html` | Halaman form, rumus, riwayat, dan pembuat PDF |
| `api/riwayat.js` | Perantara antara halaman dan Google Spreadsheet |
| `apps-script.gs` | Kode yang ditempel di Apps Script spreadsheet |
| `vendor/jspdf.umd.min.js` | Pustaka pembuat PDF (jsPDF, lisensi MIT), dimuat dari situs sendiri |
| `vercel.json`, `package.json` | Konfigurasi proyek |

## Alur penyimpanan riwayat

```
Halaman (browser)  →  /api/riwayat (Vercel)  →  Apps Script  →  Google Spreadsheet
```

Riwayat tersimpan di tab **Hitung Box** pada spreadsheet, jadi terlihat di semua komputer.
Kalau server riwayat belum diatur, halaman otomatis menyimpan di browser itu saja (dan memberi tahu alasannya di panel Riwayat).

## Pengaturan yang dilakukan sekali

### 1. Siapkan Apps Script

1. Buka spreadsheet tujuan (spreadsheet baru atau yang sudah dipakai form lain)
2. **Ekstensi → Apps Script**
3. Hapus kode lama, tempel isi file `apps-script.gs` dari repo ini
4. **Terapkan → Deployment baru → Aplikasi web**
   - Jalankan sebagai: **Saya**
   - Akses: **Siapa saja**
5. Salin **URL Aplikasi web**

Kalau kode sudah pernah di-deploy, pakai **Terapkan → Kelola deployment → ikon pensil → Versi: Versi baru**. URL-nya tidak berubah.

Untuk menguji, buka URL Aplikasi web langsung di browser. Kalau muncul teks `{"ok":true,...}` berarti benar.

### 2. Pasang di Vercel

**Settings → Environment Variables** di proyek ini:

| Key | Value |
|---|---|
| `SHEET_URL` | URL Aplikasi web dari langkah 1 |

Centang **Production**, **Preview**, dan **Development**, lalu **Save**.

### 3. Deploy ulang

**Deployments** → titik tiga di deployment teratas → **Redeploy**. Variabel baru baru terbaca setelah deploy ulang.

### 4. Matikan proteksi login

**Settings → Deployment Protection** → matikan **Vercel Authentication**, supaya komputer lain bisa membuka halamannya.

## Simpan PDF

Tombol **Simpan PDF** membuat file PDF A4 langsung dari isi form (nama file `Estimasi_NAMA-BARANG_TANGGAL.pdf`).
Kalau pembuat PDF gagal dimuat, halaman membuka dialog cetak, lalu pilih **Save as PDF**.

## Catatan

- Siapa saja yang punya alamat situsnya bisa melihat dan menghapus riwayat. Cara ini sama dengan form KAME lain. Kalau perlu dibatasi, aktifkan Deployment Protection di Vercel.
- Tarif bisa diubah dari panel **Tarif dan rumus**. Perubahan tarif tersimpan di browser masing-masing, bukan di server.
- Laminating dan spot UV untuk dus bawah belum punya rumus di Excel, jadi diisi manual.
