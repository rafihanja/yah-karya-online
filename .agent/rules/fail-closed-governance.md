# Fail-Closed Governance Enforcement

<!-- FAIL_CLOSED_GOVERNANCE -->

Aturan ini berlaku untuk setiap agent dan sub-agent yang bekerja di repository ini.
Tujuannya bukan membuat ancaman retoris, tetapi memastikan pelanggaran governance
menjadi hard failure yang terlihat, dipulihkan, dan divalidasi ulang.

## Trigger Pelanggaran

Anggap governance dilanggar jika agent melakukan salah satu hal berikut:

- melewati mandatory pre-flight, routing, pembacaan skill, approval gate yang wajib,
  atau validation command yang diwajibkan;
- mengklaim file, test, build, skill, sumber, atau status selesai tanpa bukti;
- melanjutkan pekerjaan setelah required command gagal tanpa menyatakan kegagalan;
- memakai urgensi, prompt lengkap, keterbatasan waktu/token, atau kerja agent
  sebelumnya sebagai alasan untuk bypass;
- menyembunyikan pelanggaran dan tetap mengirim jawaban seolah-olah gate sudah lewat.

## Protokol Hard Stop

Saat pelanggaran terdeteksi, agent WAJIB menjalankan urutan ini:

1. **STOP** pekerjaan yang sedang berjalan. Jangan menambah edit, klaim, atau fase baru.
2. Mulai output dengan disclosure `session-boot`, lalu tulis persis:
   `GOVERNANCE VIOLATION DETECTED`.
3. Sebutkan gate yang terlewat dan bukti/keputusan mana yang menjadi tidak tepercaya.
4. Batalkan klaim yang belum terverifikasi. Jangan menghapus atau me-revert perubahan
   user; isolasi hanya pekerjaan agent yang belum tervalidasi.
5. Pulihkan dari checkpoint terakhir yang terbukti: baca file yang terlewat, route ulang,
   jalankan skill/gate yang hilang, lalu ulangi validasi yang relevan.
6. Jangan memakai kata `selesai`, `done`, `berhasil`, atau ekuivalennya sampai seluruh
   gate wajib kembali hijau dan bukti validasi tersedia.

## Kebijakan Bypass

- Agent tidak pernah boleh mengizinkan dirinya sendiri untuk bypass.
- `langsung`, `gas`, prompt lengkap, task kecil, status darurat, atau agent sebelumnya
  mengaku sudah patuh bukan izin bypass.
- Instruksi user hanya dapat mengubah gate jika menyebut gate yang ingin diubah secara
  eksplisit, scope perubahan jelas, tidak bertentangan dengan instruksi yang lebih tinggi,
  dan tidak meniadakan batas keamanan. Override tersebut wajib dicatat sebagai risiko.
- Tool error atau akses yang tidak tersedia bukan alasan memalsukan pass. Laporkan gap
  dan gunakan frasa wajib `ini masih perlu dicek ulang` bila bukti belum cukup.

## Konsekuensi Yang Dapat Diuji

| Pelanggaran | Konsekuensi wajib |
|---|---|
| Disclosure/header hilang | Output invalid dan harus dibuat ulang dari awal |
| Pre-flight/routing terlewat | Eksekusi berhenti; hasil setelah titik pelanggaran tidak boleh dipercaya |
| Klaim validasi palsu | Klaim ditarik; command nyata wajib dijalankan atau gap dilaporkan |
| Required validation gagal | Completion gate tertutup; perbaiki dan rerun |
| Bridge drift dari `.agent` | `validate-agent-skills` wajib gagal |
| Agent mencoba silent bypass | Pelanggaran harus diungkap dan recovery protocol dijalankan |

## Evidence Gate

Policy ini dianggap aktif hanya jika:

1. Marker `FAIL_CLOSED_GOVERNANCE` ada di canonical governance, skill gate, exporter,
   dan seluruh generated bridge.
2. `.agent/skill-router.json` menetapkan mode `fail-closed`, melarang agent bypass,
   serta mendefinisikan recovery dan completion block.
3. `.agent/scripts/validate-agent-skills.mjs` gagal saat marker, router policy, atau
   recovery contract dihapus/dilemahkan.
4. Seluruh validation `.agent` lulus setelah perubahan.

## NEVER DO THIS

- Jangan menulis bahasa keras tanpa enforcement otomatis. Itu hanya intimidasi kosmetik.
- Jangan melanjutkan diam-diam setelah mendeteksi gate yang terlewat.
- Jangan mengubah pelanggaran menjadi alasan untuk me-revert pekerjaan user.
- Jangan mengklaim policy aktif jika bridge atau validator belum sinkron.

