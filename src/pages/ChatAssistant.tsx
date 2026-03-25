import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const botResponses: Record<string, string> = {
  default: "I'm your TrustAI security assistant. I can help you understand threats, check suspicious messages, and explain how our protection systems work. What would you like to know?",
  scam: "Common scam indicators include: urgency language, requests for personal info (SSN, passwords), suspicious links (bit.ly, tinyurl), promises of prizes/money, and impersonation of official organizations. Always verify directly with the supposed sender through official channels.",
  protection: "Your TrustAI protection includes: Real-time SMS scanning for phishing patterns, caller ID risk scoring, transaction anomaly detection, and continuous monitoring. All protections are active and updated regularly.",
  score: "Your Trust Score is calculated from multiple factors: SMS threat detection rate, call screening accuracy, transaction safety patterns, and your security settings. A higher score means better protection. Currently at 87/100 — great job!",
  help: "Here's what I can help with:\n• **Scam detection** — Ask about common scam patterns\n• **Trust Score** — Understand your security rating\n• **Protection status** — Check what's active\n• **Suspicious messages** — Paste a message for analysis\n• **Security tips** — Get advice on staying safe",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("scam") || lower.includes("phishing") || lower.includes("fraud")) return botResponses.scam;
  if (lower.includes("protect") || lower.includes("safe") || lower.includes("secure")) return botResponses.protection;
  if (lower.includes("score") || lower.includes("rating") || lower.includes("trust")) return botResponses.score;
  if (lower.includes("help") || lower.includes("what can")) return botResponses.help;
  return botResponses.default;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Hi! I'm your TrustAI security assistant. Ask me anything about scams, your protection status, or security tips." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(input);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          AI Security Assistant
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Chat about threats, protection, and security tips</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 glass-card p-4 mb-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`p-2 rounded-lg h-fit shrink-0 ${msg.role === "assistant" ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"}`}>
              {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "assistant"
                ? "bg-secondary/50 text-foreground"
                : "bg-primary text-primary-foreground"
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-secondary/50 rounded-xl px-4 py-3 text-sm text-muted-foreground">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about scams, protection, or security..."
          className="bg-secondary/50 border-border/50"
        />
        <Button onClick={send} disabled={!input.trim()} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
