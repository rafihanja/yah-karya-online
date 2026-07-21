// @ts-nocheck
/**
 * Contoh: JSON Envelope Standar
 * Aturan Elite: Client harus SELALU bisa menebak struktur respons.
 */

// 1. Standar Tipe Balasan
export interface JSendResponse<T> {
  status: 'success' | 'fail' | 'error';
  // Untuk 'success' dan 'fail', 'data' wajib ada
  data?: T;
  // Khusus untuk status 'error', 'message' wajib ada
  message?: string;
  // Opsional: untuk paginasi dll
  meta?: any;
}

// 2. Fungsi Pembungkus (Wrapper)
export const apiSuccess = <T>(data: T, meta?: any): JSendResponse<T> => {
  return {
    status: 'success',
    data,
    ...(meta && { meta })
  };
};

export const apiFail = <T>(failedValidations: T): JSendResponse<T> => {
  return {
    status: 'fail',
    data: failedValidations
  };
};

export const apiError = (message: string): JSendResponse<null> => {
  return {
    status: 'error',
    message
  };
};

// 3. Penggunaan di Controller
/*
  // Kondisi Sukses
  res.status(200).json(apiSuccess({ user: { id: 1, name: 'Budi' } }));

  // Kondisi Gagal Validasi Client
  res.status(400).json(apiFail({ email: 'Format email tidak valid' }));

  // Kondisi Server Meledak
  res.status(500).json(apiError('Database timeout'));
*/
