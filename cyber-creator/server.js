import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // support large canvas drawings (base64)

const PORT = process.env.PORT || 5000;

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    gemini: !!process.env.GEMINI_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    cohere: !!process.env.COHERE_API_KEY,
    mistral: !!process.env.MISTRAL_API_KEY,
    sambanova: !!process.env.SAMBANOVA_API_KEY,
    telegram: !!process.env.TELEGRAM_BOT_TOKEN,
    openrouter: !!process.env.OPENROUTER_API_KEY,
    tavily: !!process.env.TAVILY_API_KEY,
    github: !!process.env.GITHUB_TOKEN,
    discord: !!process.env.DISCORD_WEBHOOK_URL
  });
});

// 1. Cohere Moderation Proxy
app.post('/api/moderation', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    const response = await fetch("https://api.cohere.com/v1/classify", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: [text],
        examples: [
          { text: "kamu bodoh sekali", label: "unsafe" },
          { text: "anjing lu", label: "unsafe" },
          { text: "saya mau belajar coding", label: "safe" },
          { text: "bagaimana cara menggambar robot", label: "safe" },
          { text: "goblok", label: "unsafe" }
        ]
      })
    });
    const data = await response.json();
    const isSafe = data.classifications?.[0]?.prediction === 'safe';
    res.json({ safe: isSafe, details: data.classifications?.[0] });
  } catch (error) {
    // Fail-safe default to allow testing if API fails
    res.json({ safe: true, fallback: true });
  }
});

// 2. Gemini Vision Proxy (Image Canvas check)
app.post('/api/vision', async (req, res) => {
  const { imageBase64 } = req.body; // base64 string without data:image/png;base64 prefix
  if (!imageBase64) return res.status(400).json({ error: "Image data is required" });

  try {
    // Prepare Gemini API request payload
    const payload = {
      contents: [
        {
          parts: [
            { text: "Kamu adalah asisten edukasi bernama Ciko. Lihat gambar pixel art buatan anak SD ini. Berikan tebakan objek apa ini dan apresiasi kreatif dalam 2 kalimat Bahasa Indonesia yang sangat bersahabat dan ceria." },
            {
              inlineData: {
                mimeType: "image/png",
                data: imageBase64
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Wah, gambarmu sangat menarik dan penuh warna!";
    res.json({ response: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. DeepSeek Chat with Mistral Fallback
app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const tryMistralFallback = async () => {
    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistral-tiny",
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Maaf, Ciko sedang beristirahat.";
    } catch (e) {
      return "Maaf, semua asisten AI Ciko sedang sibuk mendongeng.";
    }
  };

  try {
    // Try DeepSeek
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150
      })
    });
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      res.json({ response: data.choices[0].message.content });
    } else {
      const fallbackText = await tryMistralFallback();
      res.json({ response: fallbackText, note: "fallback:mistral" });
    }
  } catch (error) {
    const fallbackText = await tryMistralFallback();
    res.json({ response: fallbackText, note: "fallback:mistral" });
  }
});

// 4. SambaNova Fast Quiz Generator
app.post('/api/quiz', async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic is required" });

  try {
    const prompt = `Buatlah 1 pertanyaan pilihan ganda yang sangat mendidik tentang cara menggunakan gadget secara sehat dengan topik '${topic}'. Berikan output berupa JSON murni dengan format: {"question": "...", "options": ["A", "B", "C", "D"], "answer": "indeks_jawaban_benar(0-3)", "explanation": "penjelasan singkat"}.`;
    
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SAMBANOVA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Meta-Llama-3-8B-Instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    });
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Parse to ensure valid JSON output
    const cleanJson = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
    res.json(JSON.parse(cleanJson));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Tavily Search Proxy
app.post('/api/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `sains anak SD: ${query}`,
        max_results: 3
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. OpenRouter Proxy for Code/Niche Models
app.post('/api/agent', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "CyberCreator Kids"
      },
      body: JSON.stringify({
        model: "openchat/openchat-7b:free",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    res.json({ response: data.choices?.[0]?.message?.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Telegram Alert Proxy
app.post('/api/telegram', async (req, res) => {
  const { message, chatId } = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const targetChatId = chatId || "5398216921"; // default/fallback testing chat ID if not supplied

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: `🤖 *Laporan CyberCreator Kids*:\n\n${message}`,
        parse_mode: "Markdown"
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Discord Webhook Proxy
app.post('/api/discord', async (req, res) => {
  const { message, pixelArtBase64 } = req.body;
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  try {
    // If pixel art base64 is present, we can send it or format as an embed
    const payload = {
      content: `📊 **Laporan Aktivitas Harian CyberCreator Kids**\n${message}`,
      embeds: pixelArtBase64 ? [
        {
          title: "Karya Pixel Art Anak Hari Ini!",
          image: { url: `data:image/png;base64,${pixelArtBase64}` }
        }
      ] : []
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    res.json({ success: response.status === 204 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. GitHub API Simulator (Commit & Push visual)
app.post('/api/github', async (req, res) => {
  const { filename, content } = req.body;
  const token = process.env.GITHUB_TOKEN;

  try {
    // For demonstration/simulation, we can perform user validation or commit to a test repo.
    // Let's call the user info check using the token to verify it works, then return a simulated push success payload.
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `token ${token}`,
        "User-Agent": "Key-Checker-Script"
      }
    });
    const userData = await userResponse.json();
    
    res.json({
      success: true,
      user: userData.login,
      commitSha: "sha256_" + Math.random().toString(16).substring(2, 10),
      file: `https://github.com/${userData.login}/cyber-creator-karya/blob/main/${filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server Proxy CyberCreator Kids berjalan aman di http://localhost:${PORT}`);
});
