import { motion } from "framer-motion";
import { getRiskLevel, getRiskColor } from "@/lib/risk-engine";

interface TrustScoreRingProps {
  score: number;
  size?: number;
  label?: string;
}

export function TrustScoreRing({ score, size = 200, label = "Trust Score" }: TrustScoreRingProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const riskLevel = getRiskLevel(100 - score);
  const color = getRiskColor(riskLevel === "safe" ? "safe" : riskLevel === "low" ? "low" : riskLevel);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative trust-ring" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="6" opacity="0.3" />
          <motion.circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold font-mono glow-text"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
        </div>
      </div>
    </div>
  );
}
