// @ts-nocheck
/**
 * Contoh: Debounce vs Throttle
 * Aturan Elite: Lindungi server dan memori client Anda.
 */

/**
 * DEBOUNCE
 * Mengeksekusi fungsi hanya SETELAH user berhenti melakukan aksi selama X milidetik.
 * Paling cocok: Kolom Pencarian (Search Bar Auto-complete).
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  } as T;
}

/**
 * THROTTLE
 * Menjamin fungsi HANYA dieksekusi MAKSIMAL 1 kali setiap X milidetik, 
 * meskipun user melakukannya ratusan kali.
 * Paling cocok: Event 'scroll' atau 'resize'.
 */
export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let inThrottle: boolean = false;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  } as T;
}
