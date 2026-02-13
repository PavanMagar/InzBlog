import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowDown, ExternalLink, Timer, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/15 bg-card/80 backdrop-blur-sm p-4 sm:p-5"
      >
        {phase === "timer" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Preparing {link.link_name}</span>
              </div>
              <span className="text-xs font-mono font-medium text-primary">{timeLeft}s</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "var(--gradient-primary)" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Link is Ready!</span>
            </div>
            <Button
              onClick={handleContinue}
              size="sm"
              className="gap-1.5 text-primary-foreground text-xs"
              style={{ background: "var(--gradient-primary)" }}
            >
              Continue <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
            </Button>
          </div>
        )}
      </motion.div>
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
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-primary/15 bg-card/80 backdrop-blur-sm p-4 sm:p-5"
      >
        {phase === "password" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Password Required</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePassword()}
                placeholder="Enter password"
                className="max-w-xs h-9"
              />
              <Button
                onClick={handlePassword}
                size="sm"
                className="text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                Submit
              </Button>
            </div>
            {passwordError && (
              <p className="text-xs text-destructive">Incorrect password. Try again.</p>
            )}
          </div>
        )}

        {phase === "access" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm font-semibold text-foreground">Your {link.link_name} link is ready</span>
            <Button
              size="sm"
              className="gap-1.5 text-primary-foreground text-xs"
              style={{ background: "var(--gradient-primary)" }}
              onClick={() => window.open(link.original_url, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Access Link
            </Button>
          </div>
        )}
      </motion.div>
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
