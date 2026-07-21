// @ts-nocheck
import rateLimit from 'express-rate-limit';

/**
 * Contoh: Middleware Pertahanan API (Rate Limiter)
 * Aturan Elite: API publik wajib diberi tameng agar tidak jebol oleh DDoS 
 * atau peretas Brute Force.
 */

// 1. Limiter Global (Santai)
// Berlaku untuk seluruh rute standar (Halaman depan, profil)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request dari IP yang sama per 15 menit
  message: {
    status: 'error',
    message: 'Terlalu banyak request. Santai dulu bos, coba lagi nanti.'
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

// 2. Limiter Khusus (Keamanan Ketat)
// Berlaku khusus untuk jalur Login / Lupa Password / OTP
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 5, // Maksimal 5x coba login dari IP yang sama per jam! (Mencegah brute force)
  message: {
    status: 'error',
    message: 'Anda terlalu sering salah mencoba. Akses dikunci sementara.'
  },
  skipSuccessfulRequests: true // Jika berhasil login, counter di-reset
});
