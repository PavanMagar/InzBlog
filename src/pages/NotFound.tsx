import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Ghost } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <>
      <SEOHead title="Page Not Found" description="The page you're looking for doesn't exist." />
      <PublicHeader />

      <main className="pt-16">
        <section className="relative flex min-h-[calc(100vh-4rem-200px)] items-center justify-center overflow-hidden">
          {/* Animated gradient orbs */}
          <motion.div
            className="pointer-events-none absolute h-[500px] w-[500px] rounded-full opacity-[0.06]"
            style={{ background: "var(--gradient-primary)", filter: "blur(120px)" }}
            animate={{ x: mousePos.x * 2, y: mousePos.y * 2 }}
            transition={{ type: "spring", damping: 30, stiffness: 100 }}
          />
          <motion.div
            className="pointer-events-none absolute right-0 top-1/4 h-[300px] w-[300px] rounded-full opacity-[0.04]"
            style={{ background: "hsl(var(--accent))", filter: "blur(100px)" }}
            animate={{ x: mousePos.x * -1.5, y: mousePos.y * -1.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 100 }}
          />

          <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
            {/* Ghost icon floating */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" as const }}
              className="mb-6"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-card shadow-lg"
                style={{ boxShadow: "var(--shadow-elevated)" }}
              >
                <Ghost className="h-10 w-10 text-primary" />
              </motion.div>
            </motion.div>

            {/* Large 404 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" as const }}
            >
              <h1 className="font-display text-[7rem] font-black leading-none tracking-tighter sm:text-[9rem]">
                <span className="gradient-text">404</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">
                Oops! This page got <span className="gradient-text">lost</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base leading-relaxed">
                Looks like this page doesn't exist or has been moved. Don't worry, let's get you back to somewhere useful.
              </p>
            </motion.div>

            {/* Path display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2"
            >
              <span className="text-xs text-muted-foreground/60">Path:</span>
              <code className="text-xs font-mono text-muted-foreground">{location.pathname}</code>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Link
                to="/"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Home className="h-4 w-4" /> Take Me Home
              </Link>
              <Link
                to="/posts"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                <Search className="h-4 w-4" /> Browse Articles
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="mt-5"
            >
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Go back
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
};

export default NotFound;
