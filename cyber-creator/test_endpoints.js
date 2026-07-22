async function test() {
  console.log("Memulai pengujian endpoint internal...");
  
  const endpoints = [
    { name: 'Cohere Moderation', url: 'http://localhost:5000/api/moderation', body: { text: "kamu pintar sekali" } },
    { name: 'DeepSeek Chat', url: 'http://localhost:5000/api/chat', body: { prompt: "Berikan sapaan 1 kalimat gaya cyberpunk." } },
    { name: 'SambaNova Quiz', url: 'http://localhost:5000/api/quiz', body: { topic: "baterai" } },
    { name: 'Tavily Search', url: 'http://localhost:5000/api/search', body: { query: "cara kerja wifi" } },
    { name: 'OpenRouter Agent', url: 'http://localhost:5000/api/agent', body: { prompt: "Jawab dengan kata 'Halo siber'" } },
    { name: 'Telegram Bot', url: 'http://localhost:5000/api/telegram', body: { message: "Tes koneksi server proxy CyberCreator" } },
    { name: 'Discord Webhook', url: 'http://localhost:5000/api/discord', body: { message: "Tes webhook server proxy" } },
    { name: 'GitHub API', url: 'http://localhost:5000/api/github', body: { filename: "tes.txt", content: "ok" } }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ep.body)
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ ${ep.name} Sukses!`);
      } else {
        const text = await res.text();
        console.log(`❌ ${ep.name} Gagal (Status ${res.status}):`, text);
      }
    } catch (e) {
      console.log(`❌ ${ep.name} Error:`, e.message);
    }
  }
}
test();
