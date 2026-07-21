// @ts-nocheck
import React from 'react';

/**
 * Contoh: Premium Card Component
 * Aturan Elite:
 * - Shadows harus halus (shadow-xl shadow-black/5)
 * - Transisi halus pada hover (-translate-y-1, hover:shadow-2xl)
 * - Hierarchy typography yang jelas.
 */

export const PremiumCard = ({ title, description, imageSrc }) => {
  return (
    <div className="group relative w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-300/60 ring-1 ring-slate-100">
      
      {/* Image Container dengan border-radius yang mengikuti parent */}
      <div className="overflow-hidden rounded-xl bg-slate-50 aspect-video relative">
        <img 
          src={imageSrc} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Optional Glassmorphism badge overlay */}
        <div className="absolute top-3 left-3 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-md">
          Featured
        </div>
      </div>

      <div className="mt-5 mb-2">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-3">
          {description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          Read Article &rarr;
        </button>
      </div>
    </div>
  );
};
