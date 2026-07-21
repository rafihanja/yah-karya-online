# 📚 Referensi Global & Dokumentasi Resmi GSAP React

Pustaka referensi ini dikumpulkan untuk menjamin bahwa segala arsitektur yang digunakan dalam skill ini memiliki dasar keilmuan yang valid.

## 1. Dokumentasi Resmi `@gsap/react`
- **Tautan**: [GSAP React Official Guide](https://gsap.com/resources/React)
- **Ringkasan**: Menjelaskan alasan kenapa hook `useGSAP` diciptakan oleh tim GreenSock. Terutama sejak rilisnya React 18 yang memperkenalkan *Strict Mode* ganda. Komponen React kini di-*mount*, di-*unmount*, lalu di-*mount* kembali dengan sangat cepat saat *development*, yang menyebabkan *timeline* GSAP berjalan dua kali dan menumpuk jika *cleanup* (`revert()`) tidak dilakukan dengan benar. Hook `useGSAP` mengatasi hal ini secara internal.
- **Relevansi**: Dasar hukum *skill* ini. Tanpa pemahaman ini, developer akan terjebak *bug flicker* tanpa henti.

## 2. "Why You Should Avoid Animating Width/Height/Top/Left" (Google Web Fundamentals)
- **Konsep**: *Pixel Pipeline* dan *Hardware Acceleration*.
- **Ringkasan**: Ketika browser merender web, urutannya adalah: *Recalculate Style -> Layout -> Paint -> Composite*. Menganimasikan properti geometri (`width`, `height`, `margin`) memaksa browser melakukan tahapan *Layout* secara terus-menerus. Sangat boros daya. Sebaliknya, menganimasikan `transform` atau `opacity` memintas tahapan *Layout* dan *Paint*, langsung menuju *Composite* yang ditangani GPU.
- **Relevansi**: Landasan mutlak untuk **GSAP Performance Checklist** pada direktori `resources/`.

## 3. Forum GSAP: Common ScrollTrigger Mistakes
- **Konsep**: ScrollTrigger *Refresh* dan *Pinning* di SPA (Single Page Applications).
- **Ringkasan**: Kesalahan paling umum pengguna Next.js/React adalah berpindah halaman tanpa mematikan (*kill*) ScrollTrigger, sehingga perhitungan *trigger* pada halaman selanjutnya berantakan karena instance lama masih hidup.
- **Relevansi**: Memperkuat alasan mengapa *cleanup* wajib diaudit melalui skrip di folder `scripts/`.
