// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Contoh: Error Boundary Wrapper
 * 
 * Aturan Elite:
 * - Error di dalam satu komponen tidak boleh membuat seluruh web menjadi blank putih.
 * - Error Boundary wajib membungkus root aplikasi atau komponen rawan error.
 * - Saat ini Error Boundary HANYA bisa ditulis dalam Class Component.
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // Komponen opsional pengganti saat error
}

interface State {
  hasError: boolean;
}

export class EliteErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state agar render berikutnya memicu fallback UI
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Di sini agent bisa menyisipkan logika untuk mengirim error ke Sentry / Log Analytics
    console.error('🚨 [Elite Error Boundary] menangkap error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-900 text-white rounded-lg text-center">
          <h2>Oops, terjadi kesalahan sistem pada komponen ini.</h2>
          <button 
            className="mt-2 px-4 py-2 bg-white text-red-900 rounded"
            onClick={() => this.setState({ hasError: false })}
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
