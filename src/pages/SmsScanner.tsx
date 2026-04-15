import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareWarning, Scan, ShieldCheck, ShieldAlert, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeSMS, getRiskColor, type AIAnalysisResult } from "@/lib/risk-engine";
import { TrustScoreRing } from "@/components/TrustScoreRing";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-message`;

export default function SmsScanner() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeSMS> & { summary?: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLocalScan = () => {
    if (!message.trim()) return;
    const localResult = analyzeSMS(message);
    setResult(localResult);
    saveToHistory(localResult);
  };

  const handleAIScan = async () => {
    if (!message.trim()) return;
    setAiLoading(true);
    try {
      const resp = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ message, type: "sms" }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "AI scan failed" }));
        throw new Error(err.error || "AI service error");
      }

      const aiResult: AIAnalysisResult = await resp.json();
      const combined = {
        score: aiResult.score,
        threats: aiResult.threats,
        riskLevel: aiResult.riskLevel,
        summary: aiResult.summary,
      };
      setResult(combined);
      saveToHistory(combined);
    } catch (err: any) {
      toast({ title: "AI Analysis Error", description: err.message, variant: "destructive" });
      // Fallback to local
      handleLocalScan();
    } finally {
      setAiLoading(false);
    }
  };

  const saveToHistory = async (scanResult: { score: number; threats: string[]; riskLevel: string }) => {
    if (!user) return;
    await supabase.from("scan_history").insert({
      user_id: user.id,
      type: "sms",
      content: message.slice(0, 500),
      risk_score: scanResult.score,
      risk_level: scanResult.riskLevel,
      threats: scanResult.threats,
      blocked: scanResult.score > 70,
    });
  };

  const examples = [
    "URGENT: Your bank account has been suspended. Click here to verify your identity immediately: bit.ly/verify-now",
    "Congratulations! You've won a $10,000 prize in our lottery. Claim now by providing your SSN.",
    "Hey, are we still on for dinner tonight at 7?",
    "Your IRS tax refund of $3,200 is ready to claim. Act now before it expires. Click: tinyurl.com/irs-refund",
  ];

  const getRiskIcon = () => {
    if (!result) return null;
    if (result.score <= 10) return <ShieldCheck className="w-8 h-8 text-accent" />;
    if (result.score <= 55) return <AlertTriangle className="w-8 h-8 text-warning" />;
    return <ShieldAlert className="w-8 h-8 text-destructive" />;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquareWarning className="w-6 h-6 text-primary" />
          SMS Scam Detector
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Paste a suspicious message to analyze it for scam patterns</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <Textarea
          placeholder="Paste suspicious SMS here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[120px] bg-secondary/50 border-border/50 text-foreground resize-none"
        />
        <div className="flex gap-2">
          <Button onClick={handleLocalScan} disabled={!message.trim() || aiLoading} className="flex-1 gap-2">
            <Scan className="w-4 h-4" /> Quick Scan
          </Button>
          <Button onClick={handleAIScan} disabled={!message.trim() || aiLoading} variant="outline" className="flex-1 gap-2">
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Deep Scan
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.score}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <TrustScoreRing score={result.score} size={140} label="Risk Score" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  {getRiskIcon()}
                  <div>
                    <h3 className="font-semibold text-foreground capitalize">{result.riskLevel} Risk</h3>
                    <p className="text-xs text-muted-foreground">
                      {result.summary || (
                        result.score <= 10 ? "This message appears safe." :
                        result.score <= 55 ? "Some suspicious patterns detected." :
                        "High risk! This is likely a scam."
                      )}
                    </p>
                  </div>
                </div>
                {result.threats.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Detected patterns:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.threats.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs border-destructive/30 text-destructive">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Try these examples:</h3>
        <div className="space-y-2">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => { setMessage(ex); setResult(null); }}
              className="w-full text-left glass-card-hover p-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
