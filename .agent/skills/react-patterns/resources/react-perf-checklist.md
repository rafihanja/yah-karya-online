# 🚀 React Performance Checklist

Daftar wajib sebelum *commit/deploy* komponen React yang kompleks. Mengabaikan daftar ini dapat menyebabkan performa *Virtual DOM* menjadi lambat (*bloated*).

## 1. Mencegah Rerender yang Tidak Perlu
- [ ] **Ya**: Memisahkan komponen berat menjadi file terpisah dan membungkusnya dengan `React.memo` jika prop-nya jarang berubah.
- [ ] **Ya**: Menggunakan `useMemo` untuk perhitungan array/objek yang berat di dalam komponen.
- [ ] **Ya**: Menggunakan `useCallback` saat melempar fungsi sebagai prop ke komponen *child* yang menggunakan `React.memo`.

## 2. Manajemen Array & Lists
- [ ] **Ya**: Semua fungsi `.map()` memiliki atribut `key` yang unik dan stabil (contoh: `key={item.id}`).
- [ ] **❌ TIDAK**: Tidak menggunakan `key={index}` kecuali list tersebut statis, tidak akan pernah diurutkan ulang, atau diubah ukurannya.

## 3. Eksekusi Side Effects (useEffect)
- [ ] **Ya**: Setiap `useEffect` memiliki *dependency array* `[...]` di bagian akhir.
- [ ] **Ya**: Mengembalikan *cleanup function* (contoh: `return () => clearTimeout(timer)`) di dalam `useEffect` yang memiliki proses asinkron/timer/event listener.

## 4. Context API vs Global State
- [ ] **Ya**: Jika data sangat sering berubah (seperti animasi atau *typing input*), gunakan *state manager* terpisah seperti **Zustand** atau **Jotai**. Jangan gunakan *React Context API* bawaan karena akan memicu *rerender* seluruh pohon komponen.
