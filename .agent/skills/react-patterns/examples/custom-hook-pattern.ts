// @ts-nocheck
import { useState, useEffect } from 'react';

/**
 * Contoh: Custom Hook Pattern (Separation of Concerns)
 * 
 * Aturan Elite:
 * - JANGAN menulis logika fetching langsung di dalam file UI (.tsx).
 * - Ekstraksi logika ke custom hook (.ts) agar bisa digunakan ulang 
 *   dan dites secara independen.
 */

// Tipe data untuk menjaga Type Safety
export interface UserData {
  id: string;
  name: string;
  email: string;
}

export const useUserData = (userId: string) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Anti-pattern prevention: mencegah memory leak jika unmount
    
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        // Simulasi pemanggilan API
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Gagal memuat data pengguna');
        
        const data = await response.json();
        if (isMounted) setUser(data);
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUser();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [userId]); // Dependency array wajib diisi!

  return { user, isLoading, error };
};
