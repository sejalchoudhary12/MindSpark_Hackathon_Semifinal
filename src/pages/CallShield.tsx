import { useState } from "react";
import { motion } from "framer-motion";
import { PhoneCall, PhoneIncoming, PhoneOff, Shield, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getRiskColor, getRiskLevel, type RiskLevel } from "@/lib/risk-engine";
import { TrustScoreRing } from "@/components/TrustScoreRing";

interface SimulatedCall {
  id: string;
  number: string;
  label: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reason: string;
}

const mockCalls: SimulatedCall[] = [
  { id: "1", number: "+1 (800) 555-0199", label: "IRS Impersonator", riskScore: 95, riskLevel: "critical", reason: "Known scam number reported by 2,400+ users" },
  { id: "2", number: "+44 20 7946 0958", label: "International Unknown", riskScore: 68, riskLevel: "high", reason: "International call from flagged region" },
  { id: "3", number: "+1 (555) 012-3456", label: "Telemarketer", riskScore: 42, riskLevel: "medium", reason: "Known telemarketing operation" },
  { id: "4", number: "+1 (212) 555-7890", label: "Your Bank", riskScore: 12, riskLevel: "low", reason: "Verified caller — matches your bank's official number" },
  { id: "5", number: "+1 (555) 867-5309", label: "Mom", riskScore: 2, riskLevel: "safe", reason: "Contact in your address book" },
];

export default function CallShield() {
  const [activeCall, setActiveCall] = useState<SimulatedCall | null>(null);
  const [callStatus, setCallStatus] = useState<"ringing" | "analyzing" | "result">("ringing");
  const [phoneInput, setPhoneInput] = useState("");
  const { toast } = useToast();

  const simulateCall = (call: SimulatedCall) => {
    setActiveCall(call);
    setCallStatus("ringing");
    setTimeout(() => setCallStatus("analyzing"), 1000);
    setTimeout(() => setCallStatus("result"), 2500);
  };

  const analyzePhoneNumber = (raw: string): SimulatedCall => {
    const number = raw.trim();
    const digits = number.replace(/\D/g, "");
    let score = 0;
    const reasons: string[] = [];

    const known = mockCalls.find((c) => c.number.replace(/\D/g, "") === digits);
    if (known) return { ...known, number };

    if (digits.length < 7) { score += 60; reasons.push("Unusually short number"); }
    if (digits.length > 13) { score += 40; reasons.push("Unusually long number"); }
    if (/^(\d)\1+$/.test(digits)) { score += 70; reasons.push("Repeating-digit pattern"); }
    if (/^1?(800|888|877|866|855)/.test(digits)) { score += 35; reasons.push("Toll-free — common scam vector"); }
    if (number.startsWith("+") && !number.startsWith("+1")) { score += 30; reasons.push("International origin"); }
    if (/^0+/.test(digits)) { score += 40; reasons.push("Suspicious leading zeros"); }
    if (digits.length >= 10 && /(\d)\1{4,}/.test(digits)) { score += 25; reasons.push("Sequential repeating digits"); }

    score = Math.min(score, 100);
    const riskLevel = getRiskLevel(score);
    const label =
      score >= 80 ? "High-Risk Caller" :
      score >= 50 ? "Suspicious Caller" :
      score >= 20 ? "Unverified Caller" : "Likely Safe";

    return {
      id: `custom-${Date.now()}`,
      number,
      label,
      riskScore: score,
      riskLevel,
      reason: reasons.length ? reasons.join(" • ") : "No suspicious patterns detected",
    };
  };

  const handleCheckNumber = () => {
    const trimmed = phoneInput.trim();
    if (!trimmed) return;
    if (!/^[\d+()\-\s]{5,}$/.test(trimmed)) {
      toast({ title: "Invalid number", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }
    simulateCall(analyzePhoneNumber(trimmed));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <PhoneCall className="w-6 h-6 text-primary" />
          Call Risk Simulator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Simulate incoming calls to see real-time risk analysis</p>
      </div>

      {/* Active call simulation */}
      {activeCall && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6"
        >
          {callStatus === "ringing" && (
            <div className="text-center space-y-4">
              <PhoneIncoming className="w-12 h-12 text-primary mx-auto animate-pulse" />
              <p className="text-foreground font-semibold">{activeCall.number}</p>
              <p className="text-sm text-muted-foreground">Incoming call...</p>
            </div>
          )}
          {callStatus === "analyzing" && (
            <div className="text-center space-y-4">
              <Shield className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="text-primary font-semibold">Analyzing caller...</p>
              <p className="text-xs text-muted-foreground">Checking against threat database</p>
            </div>
          )}
          {callStatus === "result" && (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <TrustScoreRing score={activeCall.riskScore} size={130} label="Risk" />
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="font-mono text-lg text-foreground">{activeCall.number}</p>
                <p className="font-semibold" style={{ color: getRiskColor(activeCall.riskLevel) }}>
                  {activeCall.label} — {activeCall.riskLevel.toUpperCase()} RISK
                </p>
                <p className="text-sm text-muted-foreground">{activeCall.reason}</p>
                <div className="flex gap-2 justify-center sm:justify-start pt-2">
                  {activeCall.riskScore > 50 ? (
                    <Button variant="destructive" size="sm" onClick={() => setActiveCall(null)} className="gap-1">
                      <PhoneOff className="w-3 h-3" /> Block & Report
                    </Button>
                  ) : (
                    <Button variant="default" size="sm" onClick={() => setActiveCall(null)} className="gap-1">
                      <CheckCircle className="w-3 h-3" /> Safe to Answer
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setActiveCall(null)}>Dismiss</Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Call list */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Simulate an incoming call:</h3>
        {mockCalls.map((call, i) => (
          <motion.button
            key={call.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => simulateCall(call)}
            className="w-full glass-card-hover p-4 flex items-center gap-4 text-left"
          >
            <div className="p-2 rounded-lg bg-secondary/50" style={{ color: getRiskColor(call.riskLevel) }}>
              <PhoneIncoming className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-foreground">{call.number}</p>
              <p className="text-xs text-muted-foreground">{call.label}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold" style={{ color: getRiskColor(call.riskLevel) }}>
                {call.riskScore}
              </span>
              {call.riskScore > 50 ? (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              ) : (
                <CheckCircle className="w-4 h-4 text-accent" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
