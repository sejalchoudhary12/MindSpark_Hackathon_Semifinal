import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, Phone, MessageSquare, Mail, CreditCard } from "lucide-react";
import { ThreatEvent, getRiskColor } from "@/lib/risk-engine";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const typeIcons = {
  sms: MessageSquare,
  call: Phone,
  email: Mail,
  transaction: CreditCard,
};

export function ThreatCard({ event, index }: { event: ThreatEvent; index: number }) {
  const Icon = typeIcons[event.type];
  const color = getRiskColor(event.riskLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card-hover p-4 flex items-start gap-4"
    >
      <div className="p-2.5 rounded-lg bg-secondary/50" style={{ color }}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-foreground truncate">{event.title}</span>
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-wider shrink-0 border-current"
            style={{ color, borderColor: `${color}40` }}
          >
            {event.riskLevel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(event.timestamp, { addSuffix: true })}
          </span>
          {event.blocked ? (
            <span className="flex items-center gap-1 text-[10px] text-accent">
              <ShieldCheck className="w-3 h-3" /> Blocked
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-warning">
              <ShieldAlert className="w-3 h-3" /> Flagged
            </span>
          )}
        </div>
      </div>
      <div className="font-mono text-sm font-bold shrink-0" style={{ color }}>
        {event.score}
      </div>
    </motion.div>
  );
}
