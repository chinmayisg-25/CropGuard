// src/pages/AskCropGuard.jsx
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

function AskCropGuard() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    { sender: "assistant", text: "Hello! I am CropGuard AI. Ask me any question about pests, fertilizers, or crops in your language." }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const newMsgs = [...messages, { sender: "user", text: query }];
    setMessages(newMsgs);
    if (!textToSend) setInput("");

    setTimeout(() => {
      let reply = "For standard crop health maintenance, ensure proper drainage and balanced NPK fertilizer application according to soil test recommendations.";
      if (query.toLowerCase().includes("yellow")) {
        reply = "Yellow leaf symptoms usually indicate nitrogen deficiency or root-knot nematode damage. Inspect roots for galls.";
      } else if (query.toLowerCase().includes("rain") || query.toLowerCase().includes("water")) {
        reply = "After heavy rain, apply systemic fungicides to prevent fungal blast and leaf blight development.";
      }

      setMessages((prev) => [...prev, { sender: "assistant", text: reply }]);
    }, 1000);
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Voice input is supported in modern mobile Chrome/Safari browsers.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setIsListening(false);
      handleSend(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div>
      <h1>{t("assistantTitle")}</h1>
      <p style={{ color: "#64748b", marginBottom: "16px" }}>Voice and Multilingual Agricultural AI Assistant</p>

      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-bubble ${m.sender}`}>
              {m.text}
            </div>
          ))}
        </div>

        <div className="chat-input-bar">
          <button onClick={startVoiceInput} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: isListening ? "#ef4444" : "#f1f5f9", cursor: "pointer" }}>
            {isListening ? "🎙️ Listening..." : "🎤 Voice"}
          </button>
          <input
            type="text"
            placeholder={t("askPlaceholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
          />
          <button className="btn-primary" onClick={() => handleSend()} style={{ width: "auto" }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AskCropGuard;