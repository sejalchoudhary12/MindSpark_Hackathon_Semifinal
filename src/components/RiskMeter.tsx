import { motion } from "framer-motion";

interface RiskMeterProps {
  value: number;
  label: string;
}

export function RiskMeter({ value, label }: RiskMeterProps) {
  const getColor = (v: number) => {
    if (v <= 25) return "bg-accent";
    if (v <= 50) return "bg-primary";
    if (v <= 75) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-mono font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
