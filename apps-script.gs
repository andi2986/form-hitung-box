/**
 * Apps Script untuk riwayat Form Hitung Box - Mitra Perkasa Kemasindo
 *
 * CARA PASANG
 * 1. Buka spreadsheet tujuan (boleh spreadsheet baru, atau yang sudah dipakai form lain)
 * 2. Ekstensi > Apps Script
 * 3. Hapus kode lama, tempel seluruh isi file ini
 * 4. Terapkan > Deployment baru > Aplikasi web
 *      Jalankan sebagai : Saya
 *      Akses            : Siapa saja   <-- WAJIB, bukan "Siapa saja yang memiliki Akun Google"
 * 5. Salin URL Aplikasi web, pasang di Vercel sebagai SHEET_URL
 *
 * Kalau sudah pernah di-deploy, pakai:
 *    Terapkan > Kelola deployment > ikon pensil > Versi: Versi baru
 * URL-nya tidak akan berubah.
 *
 * CARA MENGUJI
 * Buka URL Aplikasi web langsung di browser. Kalau muncul teks JSON
 * ({"ok":true,...}) berarti sudah benar. Kalau muncul halaman login
 * Google, berarti aksesnya belum "Siapa saja".
 *
 * Data masuk ke tab bernama "Hitung Box" (dibuat otomatis).
 * Kolom "Data" berisi isi form lengkap dalam format JSON, jangan diubah
 * kalau riwayat mau dibuka lagi dari halaman.
 */

const NAMA_TAB = 'Hitung Box';
const JUDUL = ['ID', 'Waktu Input', 'Tanggal', 'Customer', 'Nama Barang', 'Qty', 'Bahan',
               'Total Atas', 'Total Bawah', 'Total', 'Pakai Bawah', 'Data'];

function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(NAMA_TAB);
  if (!sh) sh = ss.insertSheet(NAMA_TAB);
  if (sh.getLastRow() === 0) {
    sh.appendRow(JUDUL);
    sh.getRange(1, 1, 1, JUDUL.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function balas(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Simpan atau hapus satu estimasi */
function doPost(e) {
  const kunci = LockService.getScriptLock();
  try {
    kunci.waitLock(15000);
    const sh = sheet();
    const d = JSON.parse(e.postData.contents);

    if (d.aksi === 'hapus') {
      const id = String(d.id || '');
      if (!id) return balas({ ok: false, pesan: 'ID kosong' });
      const akhir = sh.getLastRow();
      if (akhir < 2) return balas({ ok: false, pesan: 'Tidak ditemukan' });
      const ids = sh.getRange(2, 1, akhir - 1, 1).getValues();
      for (let i = ids.length - 1; i >= 0; i--) {
        if (String(ids[i][0]) === id) {
          sh.deleteRow(i + 2);
          return balas({ ok: true, id: id });
        }
      }
      return balas({ ok: false, pesan: 'Tidak ditemukan' });
    }

    if (d.aksi === 'simpan') {
      if (!d.id) return balas({ ok: false, pesan: 'ID kosong' });
      sh.appendRow([String(d.id), new Date(), d.tanggal, d.customer, d.barang, d.qty, d.bahan,
                    d.atas, d.bawah, d.total, d.pakaiBawah, d.data]);
      return balas({ ok: true, id: String(d.id), baris: sh.getLastRow() });
    }

    return balas({ ok: false, pesan: 'Aksi tidak dikenal' });
  } catch (err) {
    return balas({ ok: false, pesan: String(err) });
  } finally {
    try { kunci.releaseLock(); } catch (x) {}
  }
}

/** Ambil daftar estimasi terakhir, urut dari yang terbaru */
function doGet(e) {
  try {
    const sh = sheet();
    const limit = Number((e && e.parameter && e.parameter.limit) || 100);
    const baris = sh.getDataRange().getValues();

    const hasil = baris.slice(1)
      .filter(function (r) { return r[0]; })
      .reverse()
      .slice(0, limit)
      .map(function (r) {
        return {
          id: String(r[0]), dibuatPada: r[1], tanggal: r[2], customer: r[3], barang: r[4],
          qty: r[5], bahan: r[6], atas: r[7], bawah: r[8], total: r[9],
          pakaiBawah: r[10], data: r[11]
        };
      });

    return balas({ ok: true, jumlah: hasil.length, data: hasil });
  } catch (err) {
    return balas({ ok: false, pesan: String(err) });
  }
}
