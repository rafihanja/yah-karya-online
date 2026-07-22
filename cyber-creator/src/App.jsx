import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { 
  Gamepad2, 
  Paintbrush, 
  Keyboard, 
  Search, 
  BookOpen, 
  Settings, 
  AlertTriangle, 
  ShieldAlert, 
  Play, 
  ChevronRight, 
  CheckCircle2, 
  X,
  Volume2
} from 'lucide-react';
import { MONSTER_CARDS, PROLOGUE_PAGES } from './utils/localData';
import PixelCanvas from './components/PixelCanvas';
import SafeSearch from './components/SafeSearch';
import RobotRepair from './components/RobotRepair';
import StickerDiary from './components/StickerDiary';

export default function App() {
  const [activeTab, setActiveTab] = useState('prologue');
  const [prologueStep, setPrologueStep] = useState(0);
  const [avatarName, setAvatarName] = useState('Creator Cilik');
  const [completedMissions, setCompletedMissions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [serverActive, setServerActive] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [keysStatus, setKeysStatus] = useState({
    gemini: false,
    deepseek: false,
    cohere: false,
    tavily: false,
    discord: false,
    telegram: false,
    github: false,
    sambanova: false,
    mistral: false,
    openrouter: false
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testLog, setTestLog] = useState('');

  const comicRef = useRef(null);

  // Check proxy server status
  const checkServerStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/status');
      if (res.ok) {
        const data = await res.json();
        setKeysStatus(data);
        setServerActive(true);
      } else {
        setServerActive(false);
      }
    } catch (e) {
      setServerActive(false);
    }
  };

  React.useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTestKeys = async () => {
    setIsTesting(true);
    setTestLog('Memulai pengujian API...\n');
    
    const endpoints = [
      { name: 'Cohere Moderation', url: 'http://localhost:5000/api/moderation', body: { text: "halo" } },
      { name: 'DeepSeek Chat', url: 'http://localhost:5000/api/chat', body: { prompt: "Siapa kamu?" } },
      { name: 'SambaNova Quiz', url: 'http://localhost:5000/api/quiz', body: { topic: "baterai" } },
      { name: 'Tavily Search', url: 'http://localhost:5000/api/search', body: { query: "layar hp" } },
      { name: 'OpenRouter Agent', url: 'http://localhost:5000/api/agent', body: { prompt: "halo" } },
      { name: 'Telegram Bot', url: 'http://localhost:5000/api/telegram', body: { message: "Tes dari CyberCreator" } },
      { name: 'Discord Webhook', url: 'http://localhost:5000/api/discord', body: { message: "Tes dari CyberCreator Web" } },
      { name: 'GitHub API', url: 'http://localhost:5000/api/github', body: { filename: "karya.txt", content: "test" } }
    ];

    for (const ep of endpoints) {
      setTestLog(prev => prev + `Menguji ${ep.name}... `);
      try {
        const res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ep.body)
        });
        if (res.ok) {
          await res.json();
          setTestLog(prev => prev + `✅ SUKSES\n`);
        } else {
          setTestLog(prev => prev + `❌ GAGAL (Status ${res.status})\n`);
        }
      } catch (e) {
        setTestLog(prev => prev + `❌ ERROR (Koneksi putus)\n`);
      }
    }
    setTestLog(prev => prev + `\nPengujian selesai!`);
    setIsTesting(false);
  };

  // GSAP animation for comic book slide changes
  useGSAP(() => {
    if (activeTab === 'prologue') {
      gsap.fromTo(
        '.comic-card',
        { opacity: 0, scale: 0.9, y: 30, rotationX: 15 },
        { opacity: 1, scale: 1, y: 0, rotationX: 0, duration: 0.6, ease: 'back.out(1.2)' }
      );
    }
  }, [prologueStep, activeTab]);

  const handleNextStep = () => {
    if (prologueStep < PROLOGUE_PAGES.length - 1) {
      setPrologueStep(prologueStep + 1);
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-outfit crt-overlay overflow-x-hidden">
      
      {/* Background glow grids */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>
      
      {/* Decorative ambient blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative max-w-6xl mx-auto px-4 py-6 z-10 flex flex-col min-h-screen">
        
        {/* Header Bar */}
        <header className="flex justify-between items-center mb-8 glass-panel py-3 px-6 rounded-2xl neon-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-fredoka font-bold text-cyan-400 neon-text">🤖 CyberCreator</span>
            <span className="bg-cyan-500/20 text-cyan-300 text-xs px-3 py-1 rounded-full font-bold border border-cyan-500/30">FASE 5 (RELEASE)</span>
            {!isOnline && (
              <span className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full font-bold border border-amber-500/30 animate-pulse">Mode Luring</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 px-4 py-1.5 rounded-full border border-slate-800">
              <span className="text-xs text-slate-400">Creator:</span>
              <span className="text-sm font-bold text-cyan-400">{avatarName}</span>
            </div>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-slate-800 rounded-xl transition duration-200 border border-transparent hover:border-slate-700 text-slate-400 hover:text-cyan-400"
              title="API Keys Status"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Screens */}
        <main className="flex-1 flex flex-col justify-center">
          
          {/* SECTION 1: PROLOGUE SCREEN */}
          {activeTab === 'prologue' && (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center" ref={comicRef}>
              <div className="text-center mb-6">
                <span className="text-xs tracking-widest text-cyan-400 font-bold uppercase neon-text-purple">Mulai Petualangan Siber</span>
                <h1 className="text-3xl sm:text-4xl font-fredoka font-bold mt-2 text-white">Buka Gerbang Kota Rahasia</h1>
              </div>

              {/* Comic Panel */}
              <div className="comic-card w-full glass-panel rounded-3xl p-6 sm:p-8 neon-border-purple mb-6 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-2 right-4 text-xs font-mono text-purple-400">PANEL 0{PROLOGUE_PAGES[prologueStep].id}/03</div>
                
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-5xl mb-6 shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                  {PROLOGUE_PAGES[prologueStep].image}
                </div>

                <h2 className="text-xl sm:text-2xl font-fredoka font-extrabold text-purple-300 mb-4">{PROLOGUE_PAGES[prologueStep].title}</h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md">{PROLOGUE_PAGES[prologueStep].content}</p>

                {/* Progress Indicators */}
                <div className="flex gap-2 mt-8">
                  {PROLOGUE_PAGES.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-2 rounded-full transition-all duration-300 ${idx === prologueStep ? 'w-8 bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]' : 'w-2 bg-slate-800'}`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Control button */}
              <button 
                onClick={handleNextStep}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-full font-bold shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>{prologueStep === PROLOGUE_PAGES.length - 1 ? "Masuk Kota" : "Lanjutkan"}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* SECTION 2: CORE DASHBOARD & MISSION SCREENS */}
          {activeTab !== 'prologue' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch flex-1">
              
              {/* Sidebar Menu */}
              <div className="md:col-span-1 flex flex-col gap-3">
                <div className="glass-panel p-4 rounded-2xl neon-border-purple flex flex-col gap-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">Misi Kreatif</div>
                  
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl text-left transition duration-200 ${activeTab === 'dashboard' ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-slate-800'}`}
                  >
                    <Gamepad2 className="w-5 h-5 text-purple-400" />
                    <span>Kota Utama</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('canvas')}
                    className={`flex items-center justify-between w-full py-3 px-4 rounded-xl text-left transition duration-200 group ${activeTab === 'canvas' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Paintbrush className="w-5 h-5 text-cyan-400" />
                      <span>Kanvas Lukis</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('robot')}
                    className={`flex items-center justify-between w-full py-3 px-4 rounded-xl text-left transition duration-200 group ${activeTab === 'robot' ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Keyboard className="w-5 h-5 text-purple-400" />
                      <span>Reparasi Robot</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('search')}
                    className={`flex items-center justify-between w-full py-3 px-4 rounded-xl text-left transition duration-200 group ${activeTab === 'search' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-cyan-400" />
                      <span>Cari Sains</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('diary')}
                    className={`flex items-center justify-between w-full py-3 px-4 rounded-xl text-left transition duration-200 group ${activeTab === 'diary' ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent hover:border-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      <span>Stiker & Diary</span>
                    </div>
                  </button>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-950/40 text-center">
                  <span className="text-xs text-slate-500 block mb-1">Misi Selesai Hari Ini</span>
                  <span className="text-3xl font-fredoka font-extrabold text-cyan-400 neon-text">{completedMissions} / 3</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="md:col-span-3 flex flex-col gap-6">
                
                {activeTab === 'dashboard' && (
                  <>
                    {/* Visual Banner - Welcome back */}
                    <div className="glass-panel p-6 rounded-3xl neon-border flex flex-col sm:flex-row justify-between items-center gap-6 overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-[40px] pointer-events-none"></div>
                      
                      <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-fredoka font-bold text-white mb-2">Selamat Datang di Kota Siber!</h2>
                        <p className="text-slate-400 text-sm max-w-md">Pilih misi di samping: <strong>Kanvas Lukis</strong>, <strong>Reparasi Robot</strong>, atau <strong>Cari Sains</strong> untuk melatih kecerdasan siber!</p>
                      </div>
                      
                      <button 
                        onClick={() => setActiveTab('canvas')}
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-xs font-bold text-white rounded-xl transition duration-200 shadow-md"
                      >
                        Buka Misi Lukis
                      </button>
                    </div>

                    {/* Grid of Monster Cards */}
                    <div>
                      <h3 className="text-lg font-fredoka font-bold text-slate-200 mb-4 px-2">Koleksi Kartu Monster Tech Kamu</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MONSTER_CARDS.map((card) => (
                          <div 
                            key={card.id}
                            className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition duration-300 group flex flex-col justify-between"
                            style={{ boxShadow: `0 4px 20px -2px ${card.glow || 'rgba(0,0,0,0.2)'}` }}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <span className="text-3xl select-none">{card.image}</span>
                                <span className="text-[10px] bg-slate-900/80 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-mono">
                                  LV.{card.level}
                                </span>
                              </div>

                              <h4 className="font-fredoka font-bold text-slate-100 group-hover:text-cyan-300 transition duration-200">{card.name}</h4>
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-2">{card.type}</span>
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{card.description}</p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px]">
                              <span className="text-slate-500">Power: <strong className="text-cyan-400">{card.power}%</strong></span>
                              <button 
                                onClick={() => alert(`Fakta Sains: ${card.trivia}`)}
                                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                              >
                                Baca Fakta
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'canvas' && (
                  <PixelCanvas onCompleteMission={() => setCompletedMissions(prev => prev + 1)} />
                )}

                {activeTab === 'robot' && (
                  <RobotRepair onCompleteMission={() => setCompletedMissions(prev => prev + 1)} />
                )}

                {activeTab === 'search' && (
                  <SafeSearch onCompleteMission={() => setCompletedMissions(prev => prev + 1)} />
                )}

                {activeTab === 'diary' && (
                  <StickerDiary />
                )}

              </div>

            </div>
          )}

        </main>

        {/* Footer info */}
        <footer className="mt-auto pt-8 pb-4 text-center text-xs text-slate-600 border-t border-slate-900/60">
          <p>© 2026 CyberCreator Kids. Dirancang untuk literasi teknologi aman anak-anak sekitar.</p>
        </footer>

      </div>

      {/* Settings Modal (API Key Status Dialog) */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 neon-border-purple relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-fredoka font-extrabold text-slate-100 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-purple-400" />
              <span>Status Koneksi 10 API Utama</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Server Proxy Lokal: {serverActive ? (
                <span className="text-cyan-400 font-bold">🟢 ONLINE (Port 5000)</span>
              ) : (
                <span className="text-rose-500 font-bold">🔴 OFFLINE (Belum Dijalankan)</span>
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 font-fredoka">1. Gemini API</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${keysStatus.gemini ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  {keysStatus.gemini ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 font-fredoka">2. DeepSeek API</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${keysStatus.deepseek ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  {keysStatus.deepseek ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 font-fredoka">3. SambaNova API</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${keysStatus.sambanova ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  {keysStatus.sambanova ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 font-fredoka">4. Mistral API</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${keysStatus.mistral ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  {keysStatus.mistral ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 font-fredoka">5. Cohere API</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${keysStatus.cohere ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  {keysStatus.cohere ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 font-fredoka">6. Tavily API</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${keysStatus.tavily ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  {keysStatus.tavily ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 font-fredoka">7. OpenRouter API</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${keysStatus.openrouter ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  {keysStatus.openrouter ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 font-fredoka">8. Telegram API</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${keysStatus.telegram ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  {keysStatus.telegram ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 font-fredoka">9. Discord API</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${keysStatus.discord ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  {keysStatus.discord ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 font-fredoka">10. GitHub API</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${keysStatus.github ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                  {keysStatus.github ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Test API Panel */}
            {serverActive && (
              <div className="mb-4">
                <button
                  onClick={handleTestKeys}
                  disabled={isTesting}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition duration-200 shadow-md disabled:opacity-50"
                >
                  {isTesting ? 'Sedang Menguji...' : '🚀 Mulai Uji Koneksi Semua API'}
                </button>
                
                {testLog && (
                  <pre className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-cyan-400 font-mono text-left max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {testLog}
                  </pre>
                )}
              </div>
            )}

            <div className="bg-purple-950/30 border border-purple-500/20 p-4 rounded-2xl flex gap-3 text-[10px] text-purple-300">
              <AlertTriangle className="w-5 h-5 text-purple-400 shrink-0" />
              <p>Materi siber luring bawaan sedang aktif untuk menjamin keamanan. Kunci API di atas diaktifkan secara aman menggunakan Proxy Server pada pengerjaan Fase 2.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
