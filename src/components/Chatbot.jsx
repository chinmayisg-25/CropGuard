// src/components/Chatbot.jsx
import React, { useState } from 'react';

const TRANSLATIONS = {
  en: {
    title: "AI Agriculture Assistant",
    placeholder: "Ask about crop diseases, pest control...",
    send: "Send",
    welcome: "Hello! I am your CropGuard AI assistant. How can I help you today?"
  },
  hi: {
    title: "एआई कृषि सहायक",
    placeholder: "फसल की बीमारी या कीट के बारे में पूछें...",
    send: "भेजें",
    welcome: "नमस्ते! मैं आपका क्रॉपगार्ड एआई सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?"
  },
  kn: {
    title: "AI ಕೃಷಿ ಸಹಾಯaka",
    placeholder: "ಬೆಳೆ ರೋಗಗಳ ಬಗ್ಗೆ ಕೇಳಿ...",
    send: "ಕಳುಹಿಸಿ",
    welcome: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕ್ರಾಪ್‌ಗಾರ್ಡ್ AI ಸಹಾಯಕ."
  },
  te: {
    title: "AI వ్యవసాయ సహాయకుడు",
    placeholder: "పంట రోగాల గురించి అడగండి...",
    send: "పంపండి",
    welcome: "నమస్కారం! నేను మీ క్రాప్‌గార్డ్ AI సహాయకుడిని."
  }
};

export default function Chatbot() {
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: TRANSLATIONS['en'].welcome }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    setMessages(prev => [
      ...prev,
      { sender: 'bot', text: TRANSLATIONS[newLang]?.welcome || TRANSLATIONS.en.welcome }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = input;
    setInput('');
    setLoading(true);

    try {
      // Endpoint calling your trained AI backend model
      const res = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery, language: lang }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'bot', text: data.reply || "Unable to get response." }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: "Error connecting to AI service." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', maxWidth: '450px', margin: '20px auto', backgroundColor: '#f9f9f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>🤖 {t.title}</h3>
        <select value={lang} onChange={handleLanguageChange} style={{ padding: '5px' }}>
          <option value="en">English</option>
          <option value="hi">हिंदी (Hindi)</option>
          <option value="kn">ಕನ್ನಡ (Kannada)</option>
          <option value="te">తెలుగు (Telugu)</option>
        </select>
      </div>

      <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', backgroundColor: '#fff', borderRadius: '5px', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '8px 0' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: msg.sender === 'user' ? '#2e7d32' : '#e0e0e0',
              color: msg.sender === 'user' ? '#fff' : '#000'
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <p style={{ fontStyle: 'italic', color: '#666' }}>AI is thinking...</p>}
      </div>

      <div style={{ display: 'flex', gap: '5px' }}>
        <input
          type="text"
          placeholder={t.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={handleSend} style={{ padding: '8px 15px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px' }}>
          {t.send}
        </button>
      </div>
    </div>
  );
}