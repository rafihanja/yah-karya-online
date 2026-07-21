# 📚 Referensi Global: React 18+ Guidelines

Referensi resmi untuk memastikan agen mengembangkan aplikasi React menggunakan paradigma modern yang benar.

## 1. React.dev (Dokumentasi Resmi Terbaru)
- **Tautan**: [react.dev](https://react.dev)
- **Ringkasan**: Diperbarui sepenuhnya dari awal untuk mengajarkan komponen fungsional dan Hooks, mengubur dalam-dalam paradigma *Class Components* (kecuali untuk *Error Boundaries*).
- **Relevansi**: Memastikan bahwa agen tidak secara tidak sengaja menggunakan metode *lifecycle* kuno seperti `componentWillMount`.

## 2. "You Might Not Need an Effect" (React Docs)
- **Tautan**: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- **Ringkasan**: Banyak masalah *bug* React berasal dari penggunaan `useEffect` yang berlebihan. Jika Anda memutakhirkan state berdasarkan state lain, Anda sering kali bisa melakukannya langsung selama masa komputasi komponen, tanpa efek samping.
- **Relevansi**: Hukum wajib saat melakukan *code review* atau perbaikan *bug*. Kurangi jumlah `useEffect` sebanyak mungkin.

## 3. Strict Mode React 18
- **Tautan**: [Strict Mode](https://react.dev/reference/react/StrictMode)
- **Ringkasan**: React dengan sengaja memanggil siklus *mount -> unmount -> mount* di lingkungan pengembangan untuk mendeteksi komponen *impure* dan kebocoran memori (ketiadaan *cleanup*).
- **Relevansi**: Dasar mengapa pola `isMounted = false` di folder `examples/custom-hook-pattern.ts` itu penting.
