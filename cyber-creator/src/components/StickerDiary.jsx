import React, { useState } from 'react';
import { BookOpen, Award, Star, Clock, Moon, Sparkles, Smile, Check } from 'lucide-react';

const STICKERS = [
  { id: 1, title: 'Pelukis Siber', desc: 'Menyelesaikan 1 lukisan kanvas piksel', icon: '🎨', unlocked: true },
  { id: 2, title: 'Pakar Hardware', desc: 'Menjawab kuis reparasi robot', icon: '⚙️', unlocked: true },
  { id: 3, title: 'Detektif Sains', desc: 'Mencari fakta sains di Tavily Search', icon: '🔍', unlocked: true },
  { id: 4, title: 'Master Koding', desc: 'Mengirim commit karya ke GitHub', icon: '💻', unlocked: true },
  { id: 5, title: 'Anak Hebat', desc: 'Menjaga kesehatan mata & batas waktu gadget', icon: '🌟', unlocked: false },
  { id: 6, title: 'Penjelajah Sinyal', desc: 'Mempelajari cara kerja Wi-Fi & Internet', icon: '📡', unlocked: false }
];

export default function StickerDiary() {
  const [diaryNote, setDiaryNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([
    { date: 'Hari Ini', text: 'Saya belajar bahwa CPU adalah otak utama robot dan RAM memproses memori sementara!' }
  ]);
  const [isDetoxActive, setIsDetoxActive] = useState(false);

  const handleAddNote = () => {
    if (!diaryNote.trim()) return;
    setSavedNotes([{ date: 'Hari Ini', text: diaryNote }, ...savedNotes]);
    setDiaryNote('');
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl neon-border-purple flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">Fase 5 • Stiker, Catatan & Alarm Detoks</span>
          <h2 className="text-2xl font-fredoka font-bold text-white mt-1">Buku Stiker & Diary Siber</h2>
          <p className="text-slate-400 text-xs mt-1">Kumpulkan stiker prestasi belajarmu dan tulis jurnal pengalamannu di sini!</p>
        </div>

        <button
          onClick={() => setIsDetoxActive(!isDetoxActive)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold rounded-xl transition duration-200"
        >
          <Moon className="w-4 h-4 text-indigo-400" />
          <span>{isDetoxActive ? 'Matikan Mode Istirahat' : 'Aktifkan Mode Istirahat (Detoks)'}</span>
        </button>
      </div>

      {/* Screen Time Detox Sleep Screen Modal Overlay */}
      {isDetoxActive && (
        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/40 bg-indigo-950/40 text-center flex flex-col items-center gap-4 animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            😴
          </div>
          <div>
            <h3 className="text-2xl font-fredoka font-bold text-indigo-200">Asisten Ciko Mengantuk...</h3>
            <p className="text-xs text-slate-300 max-w-md mt-2 leading-relaxed">
              Kamu sudah belajar dengan sangat bagus hari ini! Sekarang istirahatkan matamu dari layar gadget ya. Coba cari 3 benda berwarna hijau di sekitarmu!
            </p>
          </div>
          <button
            onClick={() => setIsDetoxActive(false)}
            className="mt-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
          >
            Saya Sudah Istirahat!
          </button>
        </div>
      )}

      {/* Grid: Sticker Album & Journal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left: Sticker Album */}
        <div className="md:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-4">
          <h3 className="text-sm font-fredoka font-bold text-slate-200 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Album Stiker Lencana Kamu</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STICKERS.map((s) => (
              <div
                key={s.id}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center transition ${s.unlocked ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40' : 'bg-slate-950/40 border-slate-900 opacity-40'}`}
              >
                <span className="text-3xl mb-2 select-none">{s.icon}</span>
                <h4 className="font-fredoka font-bold text-xs text-slate-200">{s.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">{s.desc}</p>
                {s.unlocked && <span className="mt-2 text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">Terbuka</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Daily Learning Journal */}
        <div className="md:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-4">
          <h3 className="text-sm font-fredoka font-bold text-slate-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Jurnal Belajar Siber Hari Ini</span>
          </h3>

          <div className="flex flex-col gap-2">
            <textarea
              value={diaryNote}
              onChange={(e) => setDiaryNote(e.target.value)}
              placeholder="Tuliskan hal paling seru yang kamu pelajari hari ini..."
              rows={3}
              className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition resize-none"
            />
            <button
              onClick={handleAddNote}
              className="self-end px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition"
            >
              Simpan Catatan
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2 max-h-60 overflow-y-auto">
            {savedNotes.map((n, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-1 text-xs">
                <span className="text-[10px] text-cyan-400 font-bold font-mono">{n.date}</span>
                <p className="text-slate-300 leading-relaxed">{n.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
