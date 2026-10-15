# Form Hitung Box — Mitra Perkasa Kemasindo

Program estimasi harga box (dus atas dan bawah), dibuat dari file `FORM_HITUNG_BOX.xlsx`.
Satu file `index.html`, tanpa build dan tanpa server.

## Deploy di Vercel

1. Buka vercel.com/new dan pilih repo ini.
2. Framework Preset: **Other**. Kosongkan Build Command dan Output Directory.
3. Klik **Deploy**. Setelah itu setiap push ke `main` otomatis memperbarui situsnya.

## Catatan

- Riwayat estimasi dan tarif tersimpan di browser masing-masing (localStorage), tidak di server.
- Rumus mengikuti Excel. Tarif bisa diubah dari panel **Tarif dan rumus** di halaman.
- Laminating dan spot UV untuk dus bawah belum punya rumus di Excel, jadi diisi manual.
