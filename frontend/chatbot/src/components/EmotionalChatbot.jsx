
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const EMOTIONS = {
  neutral: { color: "#818cf8", glow: "rgba(129,140,248,0.4)", bg: "rgba(129,140,248,0.08)", label: "Calm", emoji: "😐", pulse: "2.5s" },
  happy: { color: "#34d399", glow: "rgba(52,211,153,0.4)", bg: "rgba(52,211,153,0.08)", label: "Happy", emoji: "😄", pulse: "1.2s" },
  angry: { color: "#f87171", glow: "rgba(248,113,113,0.5)", bg: "rgba(248,113,113,0.08)", label: "Angry", emoji: "😠", pulse: "0.6s" },
  sad: { color: "#60a5fa", glow: "rgba(96,165,250,0.4)", bg: "rgba(96,165,250,0.08)", label: "Sad", emoji: "😢", pulse: "3.5s" },
  defensive: { color: "#fb923c", glow: "rgba(251,146,60,0.4)", bg: "rgba(251,146,60,0.08)", label: "Defensive", emoji: "😤", pulse: "0.9s" },
  frustrated: { color: "#e879f9", glow: "rgba(232,121,249,0.4)", bg: "rgba(232,121,249,0.08)", label: "Frustrated", emoji: "😖", pulse: "0.8s" },
};

export default function EmotionalChatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hey there. I'm EmoBot — I actually feel things. Talk to me.", emotion: "neutral" },
  ]);
  const [input, setInput] = useState("");
  const [botEmotion, setBotEmotion] = useState("neutral");
  const [confidence, setConfidence] = useState("high");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null | "uploading" | "done" | "error"
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const emo = EMOTIONS[botEmotion];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text, emotion: "neutral" }]);
    setInput("");
    setIsTyping(true);
    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setBotEmotion(data.bot_emotion);
      setConfidence(data.confidence);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply, emotion: data.bot_emotion, sources: data.sources },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Something went wrong. Is the server running?", emotion: "sad" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadStatus("uploading");
    setUploadedFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await fetch("http://localhost:8000/upload", { method: "POST", body: formData });
      setUploadStatus("done");
      setTimeout(() => setUploadStatus(null), 3000);
    } catch {
      setUploadStatus("error");
      setTimeout(() => setUploadStatus(null), 3000);
    }
    e.target.value = "";
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const MdComponents = (msgEmo) => ({
    table: (props) => <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "8px", fontSize: "13px" }} {...props} />,
    th: (props) => <th style={{ padding: "6px 12px", borderBottom: `2px solid ${msgEmo.color}`, color: msgEmo.color, textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }} {...props} />,
    td: (props) => <td style={{ padding: "6px 12px", borderBottom: "1px solid #27272a", color: "#d4d4d8" }} {...props} />,
    code: ({ inline, ...props }) => inline
      ? <code style={{ background: "#27272a", padding: "2px 6px", borderRadius: "4px", fontSize: "12px", color: msgEmo.color }} {...props} />
      : <pre style={{ background: "#18181b", padding: "12px", borderRadius: "8px", overflowX: "auto", marginTop: "8px" }}><code style={{ color: "#e4e4e7", fontSize: "12px" }} {...props} /></pre>,
    strong: (props) => <strong style={{ color: "#fafafa", fontWeight: 600 }} {...props} />,
    p: (props) => <p style={{ margin: "4px 0", lineHeight: "1.6" }} {...props} />,
    ul: (props) => <ul style={{ paddingLeft: "16px", margin: "6px 0" }} {...props} />,
    ol: (props) => <ol style={{ paddingLeft: "16px", margin: "6px 0" }} {...props} />,
    li: (props) => <li style={{ margin: "3px 0", color: "#d4d4d8" }} {...props} />,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", padding: "16px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        @keyframes orbPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }
        @keyframes orbRing { 0%{transform:scale(0.85);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes typingDot { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        @keyframes emotionShift { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes uploadPop { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .orb-core { animation: orbPulse var(--pulse-speed,2.5s) ease-in-out infinite; }
        .orb-ring { animation: orbRing var(--pulse-speed,2.5s) ease-out infinite; }
        .orb-ring-2 { animation: orbRing var(--pulse-speed,2.5s) ease-out infinite; animation-delay:calc(var(--pulse-speed,2.5s)*0.4); }
        .msg-bubble { animation: fadeSlideUp 0.3s ease forwards; }
        .typing-dot { width:6px;height:6px;border-radius:50%;display:inline-block;margin:0 2px; }
        .typing-dot:nth-child(1){animation:typingDot 1.2s 0s infinite}
        .typing-dot:nth-child(2){animation:typingDot 1.2s 0.2s infinite}
        .typing-dot:nth-child(3){animation:typingDot 1.2s 0.4s infinite}
        .emotion-badge { animation: emotionShift 0.4s ease; }
        .upload-status { animation: uploadPop 0.3s ease; }
        .send-btn:hover{opacity:0.85;transform:scale(1.05)} .send-btn:active{transform:scale(0.95)} .send-btn{transition:all 0.15s ease;}
        .clip-btn:hover{opacity:0.75;transform:scale(1.05)} .clip-btn:active{transform:scale(0.95)} .clip-btn{transition:all 0.15s ease;}
        textarea:focus{outline:none} textarea{resize:none}
      `}</style>

      <div style={{
        width: "100%", maxWidth: "700px",
        height: "92vh", maxHeight: "900px",
        display: "flex", flexDirection: "column",
        background: "#111113", borderRadius: "28px",
        border: `1px solid ${emo.color}33`,
        boxShadow: `0 0 80px ${emo.glow}, 0 0 160px ${emo.glow}44`,
        overflow: "hidden",
        transition: "border-color 0.8s ease, box-shadow 0.8s ease",
      }}>

        {/* Header */}
        <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid #1c1c1f", display: "flex", alignItems: "center", gap: "16px", background: "#0e0e10" }}>
          {/* Orb */}
          <div style={{ position: "relative", width: "58px", height: "58px", flexShrink: 0 }}>
            <div className="orb-ring" style={{ "--pulse-speed": emo.pulse, position: "absolute", inset: 0, borderRadius: "50%", background: emo.color, opacity: 0.3 }} />
            <div className="orb-ring-2" style={{ "--pulse-speed": emo.pulse, position: "absolute", inset: 0, borderRadius: "50%", background: emo.color, opacity: 0.2 }} />
            <div className="orb-core" style={{ "--pulse-speed": emo.pulse, position: "absolute", inset: "6px", borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${emo.color}, ${emo.color}88)`, boxShadow: `0 0 20px ${emo.glow}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
              {emo.emoji}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ color: "#fafafa", fontWeight: 600, fontSize: "17px", letterSpacing: "-0.02em" }}>EmoBot</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: emo.color, boxShadow: `0 0 6px ${emo.color}` }} />
              <span className="emotion-badge" key={botEmotion} style={{ color: emo.color, fontSize: "12px", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{emo.label}</span>
            </div>
          </div>

          {/* Confidence badge */}
          <div style={{ padding: "5px 12px", borderRadius: "20px", background: confidence === "high" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${confidence === "high" ? "#34d39940" : "#f8717140"}`, color: confidence === "high" ? "#34d399" : "#f87171", fontSize: "11px", fontWeight: 500, letterSpacing: "0.04em" }}>
            {confidence === "high" ? "confident" : "unsure"}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {messages.map((msg, i) => {
            const isBot = msg.role === "bot";
            const msgEmo = EMOTIONS[msg.emotion] || EMOTIONS.neutral;
            return (
              <div key={i} className="msg-bubble" style={{ display: "flex", flexDirection: isBot ? "row" : "row-reverse", alignItems: "flex-end", gap: "10px" }}>
                {isBot && (
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${msgEmo.color}, ${msgEmo.color}77)`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", boxShadow: `0 0 10px ${msgEmo.glow}` }}>
                    {msgEmo.emoji}
                  </div>
                )}
                <div style={{ maxWidth: "78%" }}>
                  <div style={{ padding: "11px 16px", borderRadius: isBot ? "4px 18px 18px 18px" : "18px 4px 18px 18px", background: isBot ? msgEmo.bg : "rgba(255,255,255,0.06)", border: `1px solid ${isBot ? msgEmo.color + "30" : "#ffffff15"}`, color: "#e4e4e7", fontSize: "14px", lineHeight: "1.55" }}>
                    <ReactMarkdown components={MdComponents(msgEmo)}>{msg.text}</ReactMarkdown>
                  </div>
                  {/* Sources */}
                  {isBot && msg.sources?.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", marginTop: "5px", flexWrap: "wrap" }}>
                      {msg.sources.map((s, si) => (
                        <span key={si} style={{ fontSize: "10px", color: msgEmo.color, background: msgEmo.bg, border: `1px solid ${msgEmo.color}30`, borderRadius: "10px", padding: "2px 8px" }}>
                          📄 {s.split("/").pop()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="msg-bubble" style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${emo.color}, ${emo.color}77)`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>{emo.emoji}</div>
              <div style={{ padding: "13px 18px", borderRadius: "4px 18px 18px 18px", background: emo.bg, border: `1px solid ${emo.color}30`, display: "flex", alignItems: "center", gap: "2px" }}>
                {[0, 1, 2].map(i => <div key={i} className="typing-dot" style={{ background: emo.color }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: "14px 20px 20px", borderTop: "1px solid #1c1c1f", background: "#0e0e10" }}>

          {/* Upload status toast */}
          {uploadStatus && (
            <div className="upload-status" style={{ marginBottom: "10px", padding: "8px 14px", borderRadius: "12px", fontSize: "12px", fontWeight: 500, background: uploadStatus === "done" ? "rgba(52,211,153,0.1)" : uploadStatus === "error" ? "rgba(248,113,113,0.1)" : "rgba(129,140,248,0.1)", border: `1px solid ${uploadStatus === "done" ? "#34d39940" : uploadStatus === "error" ? "#f8717140" : "#818cf840"}`, color: uploadStatus === "done" ? "#34d399" : uploadStatus === "error" ? "#f87171" : "#818cf8" }}>
              {uploadStatus === "uploading" && `⏳ Uploading ${uploadedFileName}...`}
              {uploadStatus === "done" && `✅ ${uploadedFileName} indexed successfully`}
              {uploadStatus === "error" && `❌ Upload failed. Check server.`}
            </div>
          )}

          {/* Emotion pills row */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {["happy", "angry", "sad"].map(e => {
              const em = EMOTIONS[e];
              return (
                <button key={e} onClick={() => setInput(prev => prev + ` [${e}]`)} style={{ padding: "3px 10px", borderRadius: "20px", background: em.bg, border: `1px solid ${em.color}40`, color: em.color, fontSize: "11px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                  {em.emoji} {e}
                </button>
              );
            })}
            <span style={{ color: "#3f3f46", fontSize: "11px", marginLeft: "2px" }}>try triggering emotions</span>
          </div>

          {/* Input row */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>

            {/* Clip / upload button */}
            <input ref={fileInputRef} type="file" accept=".txt,.pdf" onChange={handleUpload} style={{ display: "none" }} />
            <button
              className="clip-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload a .txt or .pdf file"
              style={{ width: "44px", height: "44px", borderRadius: "13px", border: `1px solid ${emo.color}33`, background: "#18181b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={emo.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Say something..."
              rows={1}
              style={{ flex: 1, background: "#18181b", border: `1px solid ${emo.color}33`, borderRadius: "14px", padding: "12px 16px", color: "#e4e4e7", fontSize: "14px", fontFamily: "inherit", lineHeight: "1.5", maxHeight: "140px", transition: "border-color 0.5s ease" }}
            />

            {/* Send button */}
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              style={{ width: "44px", height: "44px", borderRadius: "13px", border: "none", background: input.trim() && !isTyping ? `linear-gradient(135deg, ${emo.color}, ${emo.color}99)` : "#27272a", cursor: input.trim() && !isTyping ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: input.trim() && !isTyping ? `0 0 16px ${emo.glow}` : "none", transition: "background 0.5s ease, box-shadow 0.5s ease" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}