import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertPopupProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
}

export function AlertPopup({ visible, title, message, onDismiss }: AlertPopupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full"
        >
          <div className="glass-card alert-glow border-destructive/30 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-destructive/20 text-destructive animate-pulse-glow">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-foreground">{title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{message}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onDismiss}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
