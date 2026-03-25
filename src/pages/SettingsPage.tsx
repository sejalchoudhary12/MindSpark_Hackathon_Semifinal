import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Shield, Bell, MessageSquare, Phone, CreditCard, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ProtectionSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ProtectionSetting[]>([
    { id: "sms", label: "SMS Protection", description: "Scan incoming messages for scam patterns", icon: MessageSquare, enabled: true },
    { id: "call", label: "Call Screening", description: "Analyze incoming calls for risk factors", icon: Phone, enabled: true },
    { id: "transaction", label: "Transaction Guard", description: "Monitor financial transactions for anomalies", icon: CreditCard, enabled: true },
    { id: "alerts", label: "Real-time Alerts", description: "Get instant notifications for detected threats", icon: Bell, enabled: true },
    { id: "stealth", label: "Stealth Mode", description: "Silently block threats without notifications", icon: Eye, enabled: false },
  ]);

  const [sensitivity, setSensitivity] = useState([65]);

  const toggle = (id: string) => {
    setSettings((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Protection Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your security preferences</p>
      </div>

      <div className="space-y-3">
        {settings.map((setting, i) => (
          <motion.div
            key={setting.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <div className={`p-2.5 rounded-lg ${setting.enabled ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
              <setting.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <Label htmlFor={setting.id} className="font-medium text-foreground cursor-pointer">{setting.label}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
            </div>
            <Switch id={setting.id} checked={setting.enabled} onCheckedChange={() => toggle(setting.id)} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Detection Sensitivity</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Higher sensitivity catches more threats but may flag safe messages. Current: <span className="font-mono text-primary">{sensitivity[0]}%</span>
        </p>
        <Slider value={sensitivity} onValueChange={setSensitivity} min={10} max={100} step={5} className="py-2" />
        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
          <span>Relaxed</span>
          <span>Balanced</span>
          <span>Aggressive</span>
        </div>
      </motion.div>
    </div>
  );
}
