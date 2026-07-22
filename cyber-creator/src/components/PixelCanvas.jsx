import React, { useState, useRef } from 'react';
import { Paintbrush, Eraser, Trash2, Sparkles, Volume2, ShieldAlert, CheckCircle, RefreshCw, Send } from 'lucide-react';

const PALETTE = [
  { name: 'Neon Cyan', color: '#06b6d4' },
  { name: 'Neon Purple', color: '#7c3aed' },
  { name: 'Neon Pink', color: '#ec4899' },
  { name: 'Neon Amber', color: '#f59e0b' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Bright Red', color: '#ef4444' },
  { name: 'Pure White', color: '#ffffff' },
  { name: 'Dark Eraser', color: '#0f172a' },
];

const PRESETS = [
  {
    name: 'Robot Ciko',
    colors: [
      '#0f172a','#0f172a','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#0f172a','#0f172a','#0f172a','#0f172a',
      '#0f172a','#06b6d4','#ffffff','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#ffffff','#06b6d4','#0f172a','#0f172a','#0f172a',
      '#0f172a','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#0f172a','#0f172a','#0f172a',
      '#0f172a','#06b6d4','#7c3aed','#7c3aed','#06b6d4','#06b6d4','#7c3aed','#7c3aed','#06b6d4','#0f172a','#0f172a','#0f172a',
      '#0f172a','#06b6d4','#7c3aed','#7c3aed','#06b6d4','#06b6d4','#7c3aed','#7c3aed','#06b6d4','#0f172a','#0f172a','#0f172a',
      '#0f172a','#06b6d4','#06b6d4','#06b6d4','#ec4899','#ec4899','#06b6d4','#06b6d4','#06b6d4','#0f172a','#0f172a','#0f172a',
      '#0f172a','#06b6d4','#06b6d4','#ec4899','#ec4899','#ec4899','#ec4899','#06b6d4','#06b6d4','#0f172a','#0f172a','#0f172a',
      '#0f172a','#0f172a','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#06b6d4','#0f172a','#0f172a','#0f172a','#0f172a',
      '#0f172a','#0f172a','#7c3aed','#7c3aed','#7c3aed','#7c3aed','#7c3aed','#7c3aed','#0f172a','#0f172a','#0f172a','#0f172a',
      '#0f172a','#0f172a','#7c3aed','#ffffff','#7c3aed','#7c3aed','#ffffff','#7c3aed','#0f172a','#0f172a','#0f172a','#0f172a',
      '#0f172a','#0f172a','#7c3aed','#7c3aed','#7c3aed','#7c3aed','#7c3aed','#7c3aed','#0f172a','#0f172a','#0f172a','#0f172a',
      '#0f172a','#0f172a','#0f172a','#06b6d4','#0f172a','#0f172a','#06b6d4','#0f172a','#0f172a','#0f172a','#0f172a','#0f172a'
    ]
  }
];

export default function PixelCanvas({ onCompleteMission }) {
  const GRID_SIZE = 12;
  const [pixels, setPixels] = useState(Array(GRID_SIZE * GRID_SIZE).fill('#0f172a'));
  const [selectedColor, setSelectedColor] = useState('#06b6d4');
  const [title, setTitle] = useState('');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [aiFeedback, setAiFeedback] = useState(null);
  const [moderationAlert, setModerationAlert] = useState(null);

  const hiddenCanvasRef = useRef(null);

  // Paint pixel
  const handlePixelClick = (index) => {
    const newPixels = [...pixels];
    newPixels[index] = selectedColor;
    setPixels(newPixels);
  };

  const handleMouseEnter = (index) => {
    if (isMouseDown) {
      handlePixelClick(index);
    }
  };

  const handleClear = () => {
    setPixels(Array(GRID_SIZE * GRID_SIZE).fill('#0f172a'));
    setAiFeedback(null);
    setModerationAlert(null);
  };

  const handlePreset = () => {
    setPixels(PRESETS[0].colors);
    setTitle('Robot Ciko');
  };

  // Convert pixel grid to base64 image via hidden canvas
  const getCanvasBase64 = () => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const scale = 20; // 12x12 grid becomes 240x240 px image
    canvas.width = GRID_SIZE * scale;
    canvas.height = GRID_SIZE * scale;

    pixels.forEach((color, i) => {
      const x = (i % GRID_SIZE) * scale;
      const y = Math.floor(i / GRID_SIZE) * scale;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, scale, scale);
    });

    // Return pure base64 without prefix data:image/png;base64,
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl.split(',')[1];
  };

  // Trigger browser Web Speech API text-to-speech voice
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stop previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // cheerful kid voice pitch
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle AI Submission
  const handleSubmitDrawing = async () => {
    if (!title.trim()) {
      alert("Tuliskan judul atau nama gambarmu dulu ya!");
      return;
    }

    setLoading(true);
    setModerationAlert(null);
    setAiFeedback(null);

    try {
      // Step 1: Cohere Moderation Check
      setLoadingStep('Memeriksa keamanan judul (Cohere Moderation)...');
      const modRes = await fetch('http://localhost:5000/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: title })
      });

      if (modRes.ok) {
        const modData = await modRes.json();
        if (modData.safe === false) {
          setLoading(false);
          setModerationAlert("Aduh! Judul gambarmu terdeteksi mengandung kata yang kurang sopan. Yuk ganti dengan kata yang baik!");
          return;
        }
      }

      // Step 2: Gemini Vision AI Analysis
      setLoadingStep('Ciko sedang melihat gambarmu (Gemini Vision AI)...');
      const imageBase64 = getCanvasBase64();
      
      const visionRes = await fetch('http://localhost:5000/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 })
      });

      if (visionRes.ok) {
        const visionData = await visionRes.json();
        const feedbackText = visionData.response || "Wah, gambarmu sangat menarik dan kreatif!";
        setAiFeedback(feedbackText);
        speakText(feedbackText);

        if (onCompleteMission) onCompleteMission();
      } else {
        // Fallback response if vision API hits error
        const fallbackMsg = `Wah! Gambar '${title}' buatanmu keren sekali! Kombinasi warnanya membuat Kota Siber semakin terang!`;
        setAiFeedback(fallbackMsg);
        speakText(fallbackMsg);
      }

    } catch (err) {
      console.error(err);
      const fallbackMsg = `Karya piksel '${title}' buatanmu sangat indah! Teruslah berkreasi!`;
      setAiFeedback(fallbackMsg);
      speakText(fallbackMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6" onMouseUp={() => setIsMouseDown(false)}>
      
      {/* Hidden canvas for image export */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl neon-border-purple flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">Fase 3 • Vision AI & Audio Voice</span>
          <h2 className="text-2xl font-fredoka font-bold text-white mt-1">Kanvas Piksel Siber</h2>
          <p className="text-slate-400 text-xs mt-1">Warnai kotak piksel di bawah ini untuk mendesain kostum atau robot pahlawanmu. AI Gemini akan melihat dan merespons kreasimu dengan suara!</p>
        </div>

        <button 
          onClick={handlePreset}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl transition duration-200"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Muat Contoh Ciko</span>
        </button>
      </div>

      {/* Main Drawing Grid Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left: Pixel Grid Canvas */}
        <div className="md:col-span-7 glass-panel p-6 rounded-3xl neon-border flex flex-col items-center">
          
          <div 
            className="grid grid-cols-12 gap-1 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shadow-2xl cursor-pointer select-none"
            onMouseDown={() => setIsMouseDown(true)}
          >
            {pixels.map((color, idx) => (
              <div
                key={idx}
                onClick={() => handlePixelClick(idx)}
                onMouseEnter={() => handleMouseEnter(idx)}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-sm transition-all duration-100 hover:scale-105 border border-slate-900/40"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Color Palette Controls */}
          <div className="w-full mt-6 flex flex-wrap justify-center items-center gap-2">
            {PALETTE.map((p) => (
              <button
                key={p.color}
                onClick={() => setSelectedColor(p.color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform duration-200 ${selectedColor === p.color ? 'scale-125 border-white shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'border-transparent hover:scale-110'}`}
                style={{ backgroundColor: p.color }}
                title={p.name}
              />
            ))}

            <div className="h-6 w-[1px] bg-slate-800 mx-2" />

            <button
              onClick={handleClear}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition border border-transparent hover:border-slate-800"
              title="Bersihkan Kanvas"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Submission & AI Feedback Panel */}
        <div className="md:col-span-5 flex flex-col gap-4">
          
          {/* Input & Submit Box */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 font-fredoka">Judul/Nama Gambarmu:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Jubah Robot Merah"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {moderationAlert && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2 text-xs text-rose-300 animate-in fade-in">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p>{moderationAlert}</p>
              </div>
            )}

            <button
              onClick={handleSubmitDrawing}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold rounded-xl text-xs text-white shadow-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim & Minta Penilaian AI</span>
                </>
              )}
            </button>

            {loading && (
              <span className="text-[10px] text-cyan-400 text-center font-mono animate-pulse">{loadingStep}</span>
            )}
          </div>

          {/* AI Feedback Screen with Speech Button */}
          {aiFeedback && (
            <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-cyan-950/20 flex flex-col gap-3 relative animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-cyan-300 font-fredoka font-bold text-sm">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  <span>Tanggapan Asisten Ciko (AI)</span>
                </div>

                <button
                  onClick={() => speakText(aiFeedback)}
                  className="p-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-xl transition border border-cyan-500/30 flex items-center gap-1.5 text-xs font-bold"
                  title="Dengarkan Suara Ciko"
                >
                  <Volume2 className="w-4 h-4 text-cyan-400 animate-bounce" />
                  <span>Ulang Suara</span>
                </button>
              </div>

              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed italic bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                "{aiFeedback}"
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
