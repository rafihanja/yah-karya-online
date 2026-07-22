import React, { useState } from 'react';
import { Search, Sparkles, Globe, ExternalLink, RefreshCw, BookOpen } from 'lucide-react';

export default function SafeSearch({ onCompleteMission }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const SUGGESTIONS = [
    "Cara kerja layar sentuh HP",
    "Kenapa baterai HP bisa habis",
    "Siapa penemu komputer pertama",
    "Bagaimana sinyal Wi-Fi terbang"
  ];

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch('http://localhost:5000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        if (onCompleteMission) onCompleteMission();
      } else {
        alert("Gagal terhubung ke mesin pencari Tavily.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl neon-border flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">Fase 4 • Tavily Search API</span>
          <h2 className="text-2xl font-fredoka font-bold text-white mt-1">Simulator Pencarian Sains Aman</h2>
          <p className="text-slate-400 text-xs mt-1">Cari fakta sains & teknologi yang kamu ingin tahu di sini. Mesin pencari ini disaring khusus agar aman untuk anak-anak!</p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ketik hal sains yang ingin kamu pelajari..."
            className="w-full pl-12 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-white text-xs rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md shrink-0 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
              <span>Mencari...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Cari Sekarang</span>
            </>
          )}
        </button>
      </div>

      {/* Suggestions Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">Rekomendasi Topik:</span>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(s);
              handleSearch(s);
            }}
            className="text-[11px] bg-slate-900/80 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 px-3 py-1.5 rounded-full border border-slate-800 hover:border-cyan-500/30 transition"
          >
            🔍 {s}
          </button>
        ))}
      </div>

      {/* Results Display */}
      {results && (
        <div className="flex flex-col gap-4 mt-2">
          <h3 className="text-sm font-fredoka font-bold text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Hasil Pencarian Sains ({results.length} ditemukan)</span>
          </h3>

          {results.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
              Tidak ditemukan hasil untuk pencarian ini. Coba ketik kata kunci sains lain ya!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {results.map((res, idx) => (
                <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-fredoka font-bold text-cyan-300 text-sm">{res.title}</h4>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-1 shrink-0"
                    >
                      <span>Buka Web</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{res.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
