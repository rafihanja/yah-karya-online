---
name: three-js-expert
description: 3D WebGL library for advanced graphics and WebGL scene optimizations.
risk: high (GPU/Memory overload, layout jank)
source: "Elite Agent Operations - Batch 8 (Gemini Upgraded)"
date_updated: "2026-06-29"
---

# Elite Three.js Expert

> **One-liner:** Panduan optimalisasi rendering grafis 3D menggunakan Three.js demi menjaga stabilitas VRAM GPU dan performa frame rate tetap konisten pada 60 FPS.

## When to Use

- Digunakan saat me-render model 3D (GLTF/OBJ), sistem partikel kompleks, atau Shader kustom (GLSL).
- Saat mengelola scene 3D dinamis dalam portofolio interaktif atau visualisasi produk 3D.
- Ketika mengoptimasi alokasi VRAM pada transisi halaman Single Page Application (SPA).

## Why This Exists

Three.js berjalan di atas WebGL yang berinteraksi langsung dengan memori kartu grafis (VRAM). Berbeda dengan objek JavaScript biasa yang dibersihkan otomatis oleh Garbage Collector browser, aset WebGL (seperti geometries, materials, textures, dan render targets) akan tetap tertahan di VRAM hingga dibebaskan secara manual menggunakan `.dispose()`. Tanpa pengelolaan disposal yang ketat pada siklus hidup unmount, aplikasi web akan memicu kebocoran memori (memory leak) yang berujung pada hang sistem atau tab crash.

## ALWAYS DO THIS

- **Lakukan disposal secara manual saat unmount** — Panggil fungsi `.dispose()` secara rekursif untuk seluruh objek `Geometry`, `Material`, dan `Texture` di dalam scene sebelum membuang referensi objek.
- **Batasi pixel ratio layar** — Selalu batasi pixel ratio maksimal 2 (`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`) guna menghindari overhead rendering resolusi ultra-tinggi pada layar Retina/DPI tinggi.
- **Gunakan InstancedMesh untuk objek berulang** — Gunakan `THREE.InstancedMesh` saat merender ratusan atau ribuan duplikat geometri sejenis untuk mengurangi draw calls menjadi satu instruksi GPU.
- **Gunakan GLTFLoader dengan Draco compression** — Kompres model GLB/GLTF menggunakan meshopt/Draco untuk memperkecil ukuran aset yang diunduh ke browser.
- **Matikan matrixAutoUpdate untuk objek statis** — Atur `mesh.matrixAutoUpdate = false` dan panggil `mesh.updateMatrix()` secara manual sekali saja untuk objek yang posisinya tidak berubah dalam scene.

## NEVER DO THIS

- ❌ **JANGAN PERNAH** membuat instansiasi `new THREE.Geometry()` atau `new THREE.Material()` baru di dalam putaran render loop (`requestAnimationFrame`). **Why fails:** GPU akan terus membuat alokasi memori baru di setiap frame (60 kali per detik), memicu kehabisan memori VRAM dalam hitungan detik. **Instead:** Deklarasikan geometries dan materials sekali di luar loop, kemudian ubah propertinya secara dinamis.
- ❌ **JANGAN PERNAH** membiarkan canvas WebGL aktif berjalan di latar belakang halaman lain. **Why fails:** Loop animasi terus berjalan memakan CPU/GPU secara sia-sia meskipun pengguna sedang berada di halaman yang tidak memiliki scene 3D. **Instead:** Hentikan loop animasi (`renderer.setAnimationLoop(null)`) pada transisi keluar halaman.
- ❌ **JANGAN PERNAH** memuat tekstur gambar tanpa kompresi dengan resolusi di atas 2K (seperti format PNG/JPG 4K mentah). **Why fails:** Memakan waktu unduhan yang lama dan memakan bandwidth VRAM yang sangat besar. **Instead:** Gunakan format `.webp` yang terkompresi dengan resolusi maksimal 1K untuk mobile, dan 2K untuk desktop.
- ❌ **JANGAN PERNAH** menggunakan efek bayangan dinamis (shadow maps) pada setiap objek cahaya dalam scene. **Why fails:** Setiap shadow-casting light memaksa GPU merender ulang scene dari sudut pandang cahaya tersebut, memotong frame rate secara drastis. **Instead:** Hanya aktifkan `castShadow = true` pada satu lampu utama (seperti DirectionalLight).

## Examples

### ✅ Good — Inisialisasi Canvas dengan Disposal Rekursif saat Unmount

```javascript
import * as THREE from "three";

let scene, camera, renderer, cubeMesh;

export function init3DScene(container) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100);
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // 1. Batasi pixel ratio maksimal 2 untuk performa mobile
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  cubeMesh = new THREE.Mesh(geometry, material);
  scene.add(cubeMesh);

  camera.position.z = 5;

  // 2. Gunakan setAnimationLoop agar kompatibel dengan WebXR & mudah dikelola
  renderer.setAnimationLoop(() => {
    cubeMesh.rotation.x += 0.01;
    cubeMesh.rotation.y += 0.01;
    renderer.render(scene, camera);
  });
}

// 3. Fungsi pembersihan memori total saat komponen di-unmount
export function destroy3DScene(container) {
  // Hentikan loop animasi utama
  if (renderer) {
    renderer.setAnimationLoop(null);
  }

  // Bersihkan scene secara rekursif
  scene.traverse((object) => {
    if (!object.isMesh) return;

    // Bersihkan geometri
    if (object.geometry) {
      object.geometry.dispose();
    }

    // Bersihkan material (termasuk array material jika multi-material)
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((mat) => {
          if (mat.map) mat.map.dispose();
          mat.dispose();
        });
      } else {
        if (object.material.map) object.material.map.dispose();
        object.material.dispose();
      }
    }
  });

  // Hapus elemen DOM canvas
  if (renderer && renderer.domElement) {
    container.removeChild(renderer.domElement);
    renderer.dispose();
  }
}
```

Why this passes: Menghentikan render loop, memproses pembersihan material secara rekursif, membatasi pixel ratio, dan melepas elemen canvas dari DOM.

### ❌ Bad — Kebocoran Memori GPU dan Instansiasi Berulang di Render Loop

```javascript
import * as THREE from "three";

export function runBadScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  
  // ERROR 1: Tidak membatasi pixel ratio (menurunkan performa pada HP berspesifikasi tinggi)
  renderer.setPixelRatio(window.devicePixelRatio); 
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  function animate() {
    requestAnimationFrame(animate);

    // ERROR 2: Membuat geometri & material baru setiap frame (60 FPS = 60 alokasi/detik)
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    renderer.render(scene, camera);
  }
  
  animate();
  
  // ERROR 3: Tidak ada ekspor fungsi cleanup/dispose untuk membersihkan scene saat navigasi SPA berubah
}
```

Why this fails: Memicu memory leak parah dengan instansiasi geometri di loop, tidak membatasi pixel ratio, menggunakan `requestAnimationFrame` mentah tanpa siklus mati, dan tidak menyediakan modul pembersihan.

---

## Technical Performance Checklist
Gunakan metrik berikut untuk memantau performa visual scene:
- **Draw Calls Target:** Kurang dari 50 kali panggilan per frame pada perangkat seluler.
- **Poly Count Limits:** Maksimal 100,000 polygon (triangles) untuk seluruh scene di mobile.
- **Frame Rate Target:** Stabil di kisaran 55–60 FPS.

---

## Failure Modes

- **Out of VRAM Tab Crash:** Browser memunculkan galat "WebGL hit a snag" atau tab tertutup otomatis karena akumulasi sisa asset geometry yang tidak dibersihkan saat berpindah rute halaman.
- **Thermal Throttling Mobile:** Handphone menjadi sangat panas dan frame rate turun ke 15 FPS akibat render resolusi ultra-DPI tanpa pembatasan `devicePixelRatio`.

## Validation

Cara memverifikasi kepatuhan penggunaan `three-js-expert`:

1. **Verify scene traverse and dispose routines:**
   Ensure geometry and material `.dispose()` calls exist inside cleanup hooks:
   ```bash
   grep -rn "dispose()" src/
   ```
2. **Check pixelRatio configurations:**
   ```bash
   grep -rn "setPixelRatio" src/
   ```
3. **Verify Build:**
   ```bash
   npm run build
   ```

## Sub-Agent Propagation

Saat menginstruksikan sub-agen untuk bekerja dengan Three.js:

> "Gunakan skill `three-js-expert`. Baca `.agent/skills/three-js-expert/SKILL.md` sebelum menulis kode. JANGAN buat instansiasi mesh/geometri baru di render loop. Selalu sediakan fungsi cleanup yang memanggil `.dispose()` secara rekursif pada geometries, materials, dan textures saat unmount, serta batasi pixel ratio maksimal 2."

## Related

- [threejs-fundamentals](../threejs-fundamentals/SKILL.md) — Scene graph dasar.
- [gsap-performance](../gsap-performance/SKILL.md) — Thread optimization.
