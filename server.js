const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const GROQ_API_KEY = "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"; 
let conversationHistory = [];
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ reply: "Tin nhắn không được để trống!" });
  }
  conversationHistory.push({
    role: "user",
    content: userMessage
  });
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Bạn là trợ lý AI thông minh, trả lời bằng tiếng Việt."
          },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    const reply = response.data.choices[0]?.message?.content || "Không có phản hồi 😢"; 
    conversationHistory.push({
      role: "assistant",
      content: reply
    });
    res.json({ reply });
  } catch (err) {
    console.error("🔥 LỖI API:", err.response?.data || err.message);
    res.status(500).json({ reply: "❌ Lỗi kết nối với Groq AI!" });
  }
});
app.post("/reset", (req, res) => {
  conversationHistory = [];
  res.json({ message: "Đã reset cuộc trò chuyện" });
});
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));