import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldCheck, ShieldAlert, TrendingUp, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrustScoreRing } from "@/components/TrustScoreRing";
import { RiskMeter } from "@/components/RiskMeter";
import { ThreatCard } from "@/components/ThreatCard";
import { AlertPopup } from "@/components/AlertPopup";
import { generateTrustScore, generateMockThreatEvents, generateWeeklyData } from "@/lib/risk-engine";

export default function Dashboard() {
  const [showAlert, setShowAlert] = useState(false);
  const trustScore = generateTrustScore();
  const threats = generateMockThreatEvents();
  const weeklyData = generateWeeklyData();

  // Find the most recent blocked / high-risk threat — only alert if one exists
  const latestBlockedThreat = threats.find((t) => t.blocked || t.score >= 70);

  useEffect(() => {
    if (!latestBlockedThreat) return;
    const timer = setTimeout(() => setShowAlert(true), 1500);
    return () => clearTimeout(timer);
  }, [latestBlockedThreat]);

  const stats = [
    { label: "Threats Blocked", value: "24", icon: ShieldCheck, color: "text-accent" },
    { label: "Active Monitors", value: "6", icon: Activity, color: "text-primary" },
    { label: "Risk Alerts", value: "3", icon: ShieldAlert, color: "text-warning" },
    { label: "Protection Rate", value: "96%", icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      {latestBlockedThreat && (
        <AlertPopup
          visible={showAlert}
          title={latestBlockedThreat.blocked ? "Threat Blocked" : "Suspicious Activity Detected"}
          message={latestBlockedThreat.description}
          onDismiss={() => setShowAlert(false)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your financial protection overview</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold font-mono text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trust Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 flex flex-col items-center justify-center"
        >
          <TrustScoreRing score={trustScore.overall} />
          <div className="mt-4 flex items-center gap-1 text-accent text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+2.4% from last week</span>
          </div>
        </motion.div>

        {/* Risk Meters */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 space-y-5"
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Protection Status
          </h3>
          <RiskMeter value={trustScore.sms} label="SMS Protection" />
          <RiskMeter value={trustScore.calls} label="Call Protection" />
          <RiskMeter value={trustScore.transactions} label="Transaction Safety" />
        </motion.div>

        {/* Weekly chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-foreground mb-4">Weekly Threat Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 92%)" }}
              />
              <Bar dataKey="threats" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} opacity={0.7} />
              <Bar dataKey="blocked" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Score trend chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="font-semibold text-foreground mb-4">Trust Score Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis dataKey="day" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
            <YAxis domain={[60, 100]} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, color: "hsl(210, 40%, 92%)" }}
            />
            <Area type="monotone" dataKey="score" stroke="hsl(174, 72%, 56%)" fill="url(#scoreGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent threats */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {threats.map((event, i) => (
            <ThreatCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
