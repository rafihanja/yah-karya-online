# 🧊 Three.js 60-FPS Optimization Checklist

Mencegah laptop pengguna meledak karena kehabisan GPU.

## 1. Pencegahan Memory Leak (Pembuangan Objek)
Javascript *Garbage Collector* TIDAK BISA menghapus buffer memori GPU. Anda yang harus memerintahkannya secara manual!
- [ ] Apakah saya sudah memanggil `geometry.dispose()`?
- [ ] Apakah saya sudah memanggil `material.dispose()`?
- [ ] Apakah saya sudah memanggil `texture.dispose()`?
- [ ] Apakah saya sudah menghapus renderer `renderer.dispose()` saat unmount?

## 2. Optimasi Model & Tekstur
- [ ] Konversi semua model 3D (`.obj`/`.fbx`) ke format **GLTF / GLB** terkompresi (gunakan DRACO compression).
- [ ] Kompres tekstur besar dari `.png/.jpg` ke format `.webp` atau `.ktx2`.
- [ ] Gabungkan material yang sama (*Material Sharing*) daripada menduplikasinya untuk setiap model.

## 3. Optimasi Cahaya & Bayangan (Lighting & Shadows)
- [ ] Jangan nyalakan `castShadow = true` pada semua lampu. Bayangan itu sangat mahal. Gunakan *Baked Shadows* (bayangan palsu berupa tekstur di lantai) jika memungkinkan.
- [ ] Hindari menggunakan terlalu banyak `PointLight`. Prioritaskan `AmbientLight` dan `DirectionalLight`.

## 4. Draw Calls (Beban Render)
- [ ] Apakah jumlah *Draw Calls* di bawah 100? (Cek menggunakan `Spector.js` atau WebGL Inspector).
- [ ] Jika ada banyak objek identik (misal ribuan daun pohon), apakah saya sudah menggunakan `InstancedMesh`?
