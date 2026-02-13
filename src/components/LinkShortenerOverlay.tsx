import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Lock, ArrowDown, ExternalLink, Timer, CheckCircle2 } from "lucide-react";

interface LinkData {
  id: string;
  link_name: string;
  original_url: string;
  password: string | null;
}

interface LinkShortenerState {
  link: LinkData | null;
  found: boolean;
  phase: "timer" | "ready" | "password" | "access";
  timeLeft: number;
}

/** Top section: timer + "scroll down" button */
export function LinkShortenerTop() {
  const { link, phase, timeLeft, handleContinue } = useLinkShortenerContext();

  if (!link || (phase !== "timer" && phase !== "ready")) return null;

  const progress = ((15 - timeLeft) / 15) * 100;

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-4 pb-2">
      <Card className="overflow-hidden border-primary/20 bg-card/70 backdrop-blur-xl">
        <CardContent className="p-5 sm:p-6">
          {phase === "timer" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  Preparing {link.link_name} Link
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Please wait {timeLeft} seconds, we are generating your link...
              </p>
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress)}% complete</span>
                <span>{timeLeft}s remaining</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <h3 className="font-display text-lg font-bold text-foreground">Link is Ready!</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Kindly click below button to scroll down and to access your {link.link_name} link.
              </p>
              <Button
                onClick={handleContinue}
                className="gap-2 text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                Click to Continue <ArrowDown className="h-4 w-4 animate-bounce" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Bottom section: password prompt + access button (placed above footer) */
export function LinkShortenerBottom() {
  const { link, phase, passwordInput, setPasswordInput, passwordError, handlePassword } =
    useLinkShortenerContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll into view when this section becomes visible
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
      {phase === "password" && (
        <Card className="overflow-hidden border-primary/20 bg-card/70 backdrop-blur-xl">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">Link is Protected</h3>
            </div>
            <p className="text-sm text-muted-foreground">Enter the password to access this link.</p>
            <div className="flex gap-2">
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePassword()}
                placeholder="Enter password"
                className="max-w-xs"
              />
              <Button onClick={handlePassword}>Submit</Button>
            </div>
            {passwordError && (
              <p className="text-sm text-destructive">Incorrect password. Please try again.</p>
            )}
          </CardContent>
        </Card>
      )}

      {phase === "access" && (
        <Card className="overflow-hidden border-primary/20 bg-card/70 backdrop-blur-xl">
          <CardContent className="space-y-4 p-5 sm:p-6 text-center">
            <h3 className="font-display text-lg font-bold text-foreground">Your link is ready!</h3>
            <Button
              size="lg"
              className="gap-2 text-white text-base"
              style={{ background: "var(--gradient-primary)" }}
              onClick={() => window.open(link.original_url, "_blank")}
            >
              <ExternalLink className="h-5 w-5" />
              Access {link.link_name} Link
            </Button>
            <p className="text-sm text-muted-foreground">
              Here's your final link, click above button to visit {link.link_name} link.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Shared context via module-level state + custom hook ──

import { createContext, useContext } from "react";

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
  const ctx = useContext(LinkShortenerContext);
  if (!ctx) throw new Error("Must be used inside LinkShortenerProvider");
  return ctx;
}

/** Wrap around the page content to provide link shortener state */
export function LinkShortenerProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [link, setLink] = useState<LinkData | null>(null);
  const [found, setFound] = useState(true);
  const [phase, setPhase] = useState<"timer" | "ready" | "password" | "access">("timer");
  const [timeLeft, setTimeLeft] = useState(15);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  // Fetch link
  useEffect(() => {
    if (!token) return;
    const fetchLink = async () => {
      const { data } = await supabase
        .from("shortened_links")
        .select("id, link_name, original_url, password")
        .or(`alias.eq.${token},token.eq.${token}`)
        .single();
      if (data) {
        setLink(data as LinkData);
      } else {
        setFound(false);
      }
    };
    fetchLink();
  }, [token]);

  // Timer
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

  // If no token or not found, just render children without overlay
  if (!token || !found || !link) {
    return <>{children}</>;
  }

  return (
    <LinkShortenerContext.Provider
      value={{
        link,
        phase,
        timeLeft,
        passwordInput,
        setPasswordInput,
        passwordError,
        handleContinue,
        handlePassword,
      }}
    >
      {children}
    </LinkShortenerContext.Provider>
  );
}
