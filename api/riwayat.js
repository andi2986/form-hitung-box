// Serverless function Vercel: perantara antara form dan Google Spreadsheet (riwayat estimasi).
//
// Form memanggil /api/riwayat, fungsi ini yang meneruskan ke Apps Script.
// Alamat Apps Script diambil dari environment variable SHEET_URL (lihat README).
//
//   GET  /api/riwayat?limit=100                 daftar estimasi, terbaru di atas
//   POST /api/riwayat  {"aksi":"simpan","entry":{...}}
//   POST /api/riwayat  {"aksi":"hapus","id":"abc123"}

const SHEET_URL = process.env.SHEET_URL;

const teks = (v, maks) => String(v === undefined || v === null ? '' : v).slice(0, maks);
const angka = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!SHEET_URL) {
    return res.status(500).json({
      ok: false,
      pesan: 'SHEET_URL belum diatur di Environment Variables Vercel'
    });
  }

  try {
    // ---------- Simpan / hapus ----------
    if (req.method === 'POST') {
      const d = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      let kirim;

      if (d.aksi === 'hapus') {
        const id = teks(d.id, 40).trim();
        if (!id) return res.status(400).json({ ok: false, pesan: 'ID kosong' });
        kirim = { aksi: 'hapus', id };
      } else if (d.aksi === 'simpan') {
        const e = d.entry || {};
        const id = teks(e.id, 40).trim();
        if (!id) return res.status(400).json({ ok: false, pesan: 'ID kosong' });
        if (!e.s || typeof e.s !== 'object') {
          return res.status(400).json({ ok: false, pesan: 'Data form kosong' });
        }
        const data = JSON.stringify(e.s);
        if (data.length > 40000) {
          return res.status(400).json({ ok: false, pesan: 'Data form terlalu besar' });
        }
        kirim = {
          aksi: 'simpan',
          id,
          tanggal: teks(e.s.tanggal, 10),
          customer: teks(e.customer, 200),
          barang: teks(e.barang, 200),
          qty: angka(e.qty),
          bahan: teks(e.bahan, 60),
          atas: angka(e.atas),
          bawah: angka(e.bawah),
          total: angka(e.total),
          pakaiBawah: e.pakaiBawah ? 'ya' : 'tidak',
          data
        };
      } else {
        return res.status(400).json({ ok: false, pesan: 'Aksi tidak dikenal' });
      }

      const r = await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(kirim),
        redirect: 'follow'
      });
      const balasan = await r.text();
      let j;
      try { j = JSON.parse(balasan); } catch { j = { ok: r.ok }; }

      if (!r.ok || j.ok === false) {
        return res.status(502).json({ ok: false, pesan: 'Spreadsheet menolak: ' + balasan.slice(0, 200) });
      }
      return res.status(200).json({ ok: true, id: kirim.id });
    }

    // ---------- Ambil daftar ----------
    if (req.method === 'GET') {
      const limit = Math.min(Math.max(Number(req.query && req.query.limit) || 100, 1), 500);
      const r = await fetch(`${SHEET_URL}?limit=${limit}`, { redirect: 'follow' });
      const balasan = await r.text();

      let j;
      try { j = JSON.parse(balasan); }
      catch {
        return res.status(502).json({
          ok: false,
          pesan: 'Balasan spreadsheet bukan JSON. Pastikan Apps Script sudah di-deploy dengan akses "Siapa saja".'
        });
      }
      if (j.ok === false) return res.status(502).json({ ok: false, pesan: String(j.pesan || 'Spreadsheet menolak') });

      const data = (j.data || []).map((x) => {
        let s = null;
        try { s = JSON.parse(x.data); } catch { s = null; }
        return {
          id: x.id,
          dibuatPada: x.dibuatPada,
          customer: x.customer,
          barang: x.barang,
          qty: x.qty,
          bahan: x.bahan,
          atas: x.atas,
          bawah: x.bawah,
          total: x.total,
          pakaiBawah: x.pakaiBawah === 'ya',
          s
        };
      }).filter((x) => x.id);

      return res.status(200).json({ ok: true, jumlah: data.length, data });
    }

    return res.status(405).json({ ok: false, pesan: 'Metode tidak didukung' });
  } catch (err) {
    return res.status(500).json({ ok: false, pesan: err.message });
  }
}
