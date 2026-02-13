import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowDown, ExternalLink, Timer, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LinkData {
  id: string;
  link_name: string;
  original_url: string;
  password: string | null;
}

/** Top section: timer + "scroll down" button */
export function LinkShortenerTop() {
  const ctx = useLinkShortenerContext();

  if (!ctx) return null;
  const { link, phase, timeLeft, handleContinue } = ctx;
  if (!link || (phase !== "timer" && phase !== "ready")) return null;

  const progress = ((15 - timeLeft) / 15) * 100;

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-4 pb-2">
      <AnimatePresence mode="wait">
        {phase === "timer" ? (
          <motion.div
            key="timer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl shadow-[var(--shadow-elevated)]">
              {/* Gradient top accent */}
              <div className="h-1" style={{ background: "var(--gradient-primary)" }} />

              <div className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Timer className="h-5 w-5 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Preparing {link.link_name} Link
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Please wait {timeLeft} seconds...
                    </p>
                  </div>
                </div>

                {/* Custom gradient progress bar */}
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full opacity-40"
                    style={{ background: "var(--gradient-primary)", filter: "blur(4px)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">{Math.round(progress)}% complete</span>
                  <motion.span
                    key={timeLeft}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-mono font-bold text-primary"
                  >
                    {timeLeft}s remaining
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl shadow-[var(--shadow-elevated)]">
              {/* Gradient top accent */}
              <div className="h-1" style={{ background: "var(--gradient-primary)" }} />

              <div className="p-5 sm:p-7 space-y-5 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "var(--gradient-subtle)" }}
                >
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </motion.div>

                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Link is Ready!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click below to scroll down and access your <span className="font-semibold text-foreground">{link.link_name}</span> link.
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className="gap-2 text-primary-foreground text-base shadow-[var(--shadow-glow)] transition-shadow hover:shadow-[var(--shadow-elevated)]"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Click to Continue
                    <ArrowDown className="h-4 w-4 animate-bounce" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Bottom section: password prompt + access button (placed above footer) */
export function LinkShortenerBottom() {
  const ctx = useLinkShortenerContext();
  const { link, phase, passwordInput, setPasswordInput, passwordError, handlePassword } =
    ctx ?? { link: null, phase: "timer" as const, passwordInput: "", setPasswordInput: () => {}, passwordError: false, handlePassword: () => {} };
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === "password" || phase === "access") {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [phase]);

  if (!link || (phase !== "password" && phase !== "access")) return null;

  return (
    <div ref={bottomRef} className="mx-auto max-w-7xl px-5 sm:px-8 pb-10">
      <AnimatePresence mode="wait">
        {phase === "password" && (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl shadow-[var(--shadow-elevated)]">
              <div className="h-1" style={{ background: "var(--gradient-primary)" }} />

              <div className="space-y-5 p-5 sm:p-7">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Lock className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">Link is Protected</h3>
                    <p className="text-sm text-muted-foreground">Enter the password to access this link.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePassword()}
                    placeholder="Enter password"
                    className="max-w-xs"
                  />
                  <Button
                    onClick={handlePassword}
                    className="text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Submit
                  </Button>
                </div>

                <AnimatePresence>
                  {passwordError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-destructive"
                    >
                      Incorrect password. Please try again.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "access" && (
          <motion.div
            key="access"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl shadow-[var(--shadow-elevated)]">
              <div className="h-1" style={{ background: "var(--gradient-primary)" }} />

              <div className="space-y-5 p-5 sm:p-7 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "var(--gradient-subtle)" }}
                >
                  <ExternalLink className="h-7 w-7 text-primary" />
                </motion.div>

                <h3 className="font-display text-xl font-bold text-foreground">Your link is ready!</h3>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    size="lg"
                    className="gap-2 text-primary-foreground text-base shadow-[var(--shadow-glow)] transition-all hover:shadow-[var(--shadow-elevated)] hover:scale-105"
                    style={{ background: "var(--gradient-primary)" }}
                    onClick={() => window.open(link.original_url, "_blank")}
                  >
                    <ExternalLink className="h-5 w-5" />
                    Access {link.link_name} Link
                  </Button>
                </motion.div>

                <p className="text-sm text-muted-foreground">
                  Click the button above to visit your <span className="font-semibold text-foreground">{link.link_name}</span> link.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Context ──

interface LinkShortenerContextValue {
  link: LinkData | null;
  phase: "timer" | "ready" | "password" | "access";
  timeLeft: number;
  passwordInput: string;
  setPasswordInput: (v: string) => void;
  passwordError: boolean;
  handleContinue: () => void;
  handlePassword: () => void;
}

const LinkShortenerContext = createContext<LinkShortenerContextValue | null>(null);

function useLinkShortenerContext() {
  return useContext(LinkShortenerContext);
}

export function LinkShortenerProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [link, setLink] = useState<LinkData | null>(null);
  const [found, setFound] = useState(true);
  const [phase, setPhase] = useState<"timer" | "ready" | "password" | "access">("timer");
  const [timeLeft, setTimeLeft] = useState(15);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchLink = async () => {
      const { data } = await supabase
        .from("shortened_links")
        .select("id, link_name, original_url, password")
        .or(`alias.eq.${token},token.eq.${token}`)
        .maybeSingle();
      if (data) {
        setLink(data as LinkData);
      } else {
        setFound(false);
      }
    };
    fetchLink();
  }, [token]);

  useEffect(() => {
    if (!link || phase !== "timer") return;
    if (timeLeft <= 0) {
      setPhase("ready");
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [link, phase, timeLeft]);

  const handleContinue = async () => {
    try {
      await supabase.functions.invoke("increment-link-click", {
        body: { link_id: link!.id },
      });
    } catch {}
    if (link!.password) {
      setPhase("password");
    } else {
      setPhase("access");
    }
  };

  const handlePassword = () => {
    if (passwordInput === link!.password) {
      setPasswordError(false);
      setPhase("access");
    } else {
      setPasswordError(true);
    }
  };

  if (!token || !found || !link) {
    return <>{children}</>;
  }

  return (
    <LinkShortenerContext.Provider
      value={{ link, phase, timeLeft, passwordInput, setPasswordInput, passwordError, handleContinue, handlePassword }}
    >
      {children}
    </LinkShortenerContext.Provider>
  );
}
