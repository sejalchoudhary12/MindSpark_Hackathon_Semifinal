import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, Phone, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "select" | "email" | "phone";
type AuthStep = "input" | "otp" | "password";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("select");
  const [step, setStep] = useState<AuthStep>("input");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidPhone = (p: string) => /^\+\d{10,15}$/.test(p);

  const handleEmailAuth = async () => {
    if (!isValidEmail(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a verification link. Please verify to continue." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOtp = async () => {
    if (!isValidPhone(phone)) {
      toast({ title: "Invalid phone", description: "Enter a valid phone with country code (e.g. +1234567890).", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setStep("otp");
      toast({ title: "OTP Sent", description: "Check your phone for the verification code." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-primary/20">
              <Shield className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Trust<span className="text-primary">AI</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Financial Bodyguard — Sign in to continue</p>
        </div>

        <div className="glass-card p-6 space-y-6">
          {mode === "select" && (
            <div className="space-y-3">
              <Button onClick={() => { setMode("email"); setStep("input"); }} variant="outline" className="w-full justify-start gap-3 h-12">
                <Mail className="w-5 h-5 text-primary" />
                Continue with Email
              </Button>
              <Button onClick={() => { setMode("phone"); setStep("input"); }} variant="outline" className="w-full justify-start gap-3 h-12">
                <Phone className="w-5 h-5 text-primary" />
                Continue with Phone
              </Button>
            </div>
          )}

          {mode === "email" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{isSignUp ? "Create Account" : "Sign In"} with Email</h2>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
              <Button onClick={handleEmailAuth} disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary ml-1 hover:underline">
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
              <button onClick={() => { setMode("select"); setStep("input"); }} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                ← Back to options
              </button>
            </div>
          )}

          {mode === "phone" && step === "input" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Sign In with Phone</h2>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">Include country code (e.g. +91, +1)</p>
              <Button onClick={handlePhoneSendOtp} disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Send OTP
              </Button>
              <button onClick={() => { setMode("select"); setStep("input"); }} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                ← Back to options
              </button>
            </div>
          )}

          {mode === "phone" && step === "otp" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Enter OTP</h2>
              <p className="text-sm text-muted-foreground">We sent a 6-digit code to {phone}</p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={handlePhoneVerifyOtp} disabled={loading || otp.length !== 6} className="w-full gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Verify & Sign In
              </Button>
              <button onClick={() => setStep("input")} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                ← Change number
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
