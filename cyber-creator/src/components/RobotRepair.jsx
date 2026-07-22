import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, AlertCircle, RefreshCw, Send, GitCommit, MessageSquare, Bot } from 'lucide-react';

export default function RobotRepair({ onCompleteMission }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null); // 'correct' | 'wrong'
  const [repairProgress, setRepairProgress] = useState(30);

  // Notification States
  const [telegramStatus, setTelegramStatus] = useState('');
  const [discordStatus, setDiscordStatus] = useState('');
  const [githubStatus, setGithubStatus] = useState('');

  const fetchNewQuiz = async () => {
    setLoading(true);
    setSelectedOption(null);
    setAnswerStatus(null);

    const TOPICS = ["baterai HP", "layar sentuh", "koneksi wifi", "prosesor CPU", "memori RAM"];
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    try {
      const res = await fetch('http://localhost:5000/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: randomTopic })
      });

      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        // Fallback offline quiz
        setQuiz({
          question: "Komponen HP mana yang bertugas menyimpan foto dan lagu secara permanen?",
          options: ["ROM / Penyimpanan", "Speaker", "Layar", "Kabel"],
          answer: 0,
          explanation: "ROM (Read Only Memory) bertugas menyimpan berkas selamanya!"
        });
      }
    } catch (err) {
      setQuiz({
        question: "Apa fungsi dari sinyal Wi-Fi di HP kamu?",
        options: ["Mengisi daya baterai", "Terhubung ke internet tanpa kabel", "Memutar suara musik", "Mewarnai layar"],
        answer: 1,
        explanation: "Wi-Fi mengirim data via gelombang radio tanpa kabel!"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewQuiz();
  }, []);

  const handleSelectOption = (index) => {
    if (selectedOption !== null) return; // prevent re-selecting
    setSelectedOption(index);

    if (index === Number(quiz.answer)) {
      setAnswerStatus('correct');
      setRepairProgress((prev) => Math.min(100, prev + 25));
      if (onCompleteMission) onCompleteMission();
    } else {
      setAnswerStatus('wrong');
    }
  };

  // 1. Send Telegram Alert
  const handleSendTelegram = async () => {
    setTelegramStatus('Mengirim...');
    try {
      const res = await fetch('http://localhost:5000/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Hore! Anak Anda telah menyelesaikan kuis reparasi robot dengan progres ${repairProgress}%!` })
      });
      if (res.ok) setTelegramStatus('✅ Terkirim ke Telegram!');
      else setTelegramStatus('❌ Gagal Mengirim');
    } catch (e) {
      setTelegramStatus('❌ Error Jaringan');
    }
  };

  // 2. Send Discord Webhook
  const handleSendDiscord = async () => {
    setDiscordStatus('Mengirim...');
    try {
      const res = await fetch('http://localhost:5000/api/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Anak Anda baru saja berhasil memperbaiki komponen Robot Ciko (Progres: ${repairProgress}%)!` })
      });
      if (res.ok) setDiscordStatus('✅ Terkirim ke Discord!');
      else setDiscordStatus('❌ Gagal Mengirim');
    } catch (e) {
      setDiscordStatus('❌ Error Jaringan');
    }
  };

  // 3. GitHub Push Simulator
  const handleGithubPush = async () => {
    setGithubStatus('Pushing commit...');
    try {
      const res = await fetch('http://localhost:5000/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: "laporan_belajar.json", content: `{"progres": ${repairProgress}}` })
      });
      if (res.ok) {
        const data = await res.json();
        setGithubStatus(`✅ Pushed! Commit: ${data.commitSha}`);
      } else {
        setGithubStatus('❌ Commit Gagal');
      }
    } catch (e) {
      setGithubStatus('❌ Error Jaringan');
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl neon-border-purple flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">Fase 4 • SambaNova & Multi-API Notifier</span>
          <h2 className="text-2xl font-fredoka font-bold text-white mt-1">Reparasi Robot Siber</h2>
          <p className="text-slate-400 text-xs mt-1">Jawab pertanyaan sains di bawah ini untuk memperbaiki mesin robot Ciko yang rusak!</p>
        </div>

        {/* Robot Health Meter */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-4 shrink-0">
          <Wrench className="w-6 h-6 text-cyan-400 animate-pulse" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Kondisi Robot Ciko:</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500" style={{ width: `${repairProgress}%` }} />
              </div>
              <span className="text-xs font-bold text-cyan-400 font-mono">{repairProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col gap-6">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-cyan-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono">Menyiapkan kuis dari SambaNova AI...</span>
          </div>
        ) : quiz ? (
          <>
            <div>
              <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-widest">Pertanyaan Perbaikan:</span>
              <h3 className="text-lg sm:text-xl font-fredoka font-bold text-white mt-2 leading-relaxed">{quiz.question}</h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quiz.options && quiz.options.map((opt, idx) => {
                let btnStyle = "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-900";
                if (selectedOption === idx) {
                  if (answerStatus === 'correct') btnStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                  else btnStyle = "bg-rose-950/40 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-fredoka font-bold transition-all duration-200 flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedOption === idx && answerStatus === 'correct' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {selectedOption === idx && answerStatus === 'wrong' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Question */}
            {selectedOption !== null && (
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-center gap-4 ${answerStatus === 'correct' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'}`}>
                <div>
                  <strong className="block text-xs uppercase tracking-wider mb-1">
                    {answerStatus === 'correct' ? "Jawaban Benar! Mesin Robot Membaik!" : "Kurang Tepat, Coba Lagi!"}
                  </strong>
                  <p className="text-xs leading-relaxed text-slate-300">{quiz.explanation}</p>
                </div>

                <button
                  onClick={fetchNewQuiz}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition duration-200 shadow-md shrink-0"
                >
                  Soal Berikutnya ➔
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Parent Alert Notifiers & GitHub Simulator Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-4">
        <h3 className="text-sm font-fredoka font-bold text-slate-200 flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          <span>Bagikan Laporan Kemajuan & Simpan Karya</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Telegram Button */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-200 block mb-1 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Telegram Bot</span>
              </span>
              <p className="text-[10px] text-slate-400">Kirim progres robot ke Telegram ortu.</p>
            </div>
            <button
              onClick={handleSendTelegram}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition"
            >
              Kirim Telegram
            </button>
            {telegramStatus && <span className="text-[10px] text-cyan-300 font-mono text-center">{telegramStatus}</span>}
          </div>

          {/* Discord Button */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-200 block mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Discord Webhook</span>
              </span>
              <p className="text-[10px] text-slate-400">Kirim laporan ke channel Discord.</p>
            </div>
            <button
              onClick={handleSendDiscord}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition"
            >
              Kirim Discord
            </button>
            {discordStatus && <span className="text-[10px] text-purple-300 font-mono text-center">{discordStatus}</span>}
          </div>

          {/* GitHub Simulator Button */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-200 block mb-1 flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-pink-400" />
                <span>GitHub API</span>
              </span>
              <p className="text-[10px] text-slate-400">Simulasikan commit & push karya.</p>
            </div>
            <button
              onClick={handleGithubPush}
              className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl transition"
            >
              Commit ke Git
            </button>
            {githubStatus && <span className="text-[10px] text-pink-300 font-mono text-center truncate">{githubStatus}</span>}
          </div>

        </div>
      </div>

    </div>
  );
}
