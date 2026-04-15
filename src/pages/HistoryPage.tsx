import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Shield, MessageSquareWarning, PhoneCall, Link, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getRiskColor, type RiskLevel } from "@/lib/risk-engine";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ScanRecord {
  id: string;
  type: string;
  content: string;
  risk_score: number;
  risk_level: string;
  threats: string[];
  blocked: boolean;
  created_at: string;
}

const typeIcons: Record<string, React.ElementType> = {
  sms: MessageSquareWarning,
  call: PhoneCall,
  url: Link,
};

export default function HistoryPage() {
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("scan_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const deleteRecord = async (id: string) => {
    const { error } = await supabase.from("scan_history").delete().eq("id", id);
    if (!error) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const clearAll = async () => {
    if (!user) return;
    const { error } = await supabase.from("scan_history").delete().neq("id", "");
    if (!error) {
      setRecords([]);
      toast({ title: "Cleared", description: "All scan history has been removed." });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Scan History
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Your past threat scans and analysis results</p>
        </div>
        {records.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll} className="gap-1 text-destructive">
            <Trash2 className="w-3 h-3" /> Clear All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : records.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No scan history yet. Start scanning messages to build your history.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {records.map((record, i) => {
              const Icon = typeIcons[record.type] || Shield;
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card p-4 flex items-start gap-4"
                >
                  <div className="p-2 rounded-lg bg-secondary shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase"
                        style={{ borderColor: getRiskColor(record.risk_level as RiskLevel), color: getRiskColor(record.risk_level as RiskLevel) }}
                      >
                        {record.risk_level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(record.created_at), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground truncate">{record.content}</p>
                    {record.threats && record.threats.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {record.threats.map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px] border-destructive/30 text-destructive">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-bold" style={{ color: getRiskColor(record.risk_level as RiskLevel) }}>
                      {record.risk_score}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteRecord(record.id)}>
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
