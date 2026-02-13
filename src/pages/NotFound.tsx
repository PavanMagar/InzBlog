import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Compass } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";

const NotFound = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
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
          {/* Background orbs */}
          <motion.div
            className="pointer-events-none absolute h-[600px] w-[600px] rounded-full opacity-[0.07]"
            style={{ background: "var(--gradient-primary)", filter: "blur(140px)" }}
            animate={{ x: mousePos.x * 2.5, y: mousePos.y * 2.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 80 }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-20 -left-20 h-[350px] w-[350px] rounded-full opacity-[0.05]"
            style={{ background: "hsl(var(--accent))", filter: "blur(100px)" }}
            animate={{ x: mousePos.x * -1.5, y: mousePos.y * -1.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 80 }}
          />

          <div className="relative mx-auto max-w-2xl px-5 py-16 text-center sm:px-8 sm:py-24">
            {/* Floating compass icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-8"
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-card"
                style={{ boxShadow: "var(--shadow-elevated)" }}
              >
                <Compass className="h-12 w-12 text-primary" strokeWidth={1.5} />
              </motion.div>
            </motion.div>

            {/* 404 number */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-8xl font-black leading-none tracking-tighter sm:text-[10rem]"
            >
              <span className="gradient-text">404</span>
            </motion.h1>

            {/* Title & description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-4"
            >
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                Page not found
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                The page you're looking for doesn't exist or may have been moved.
              </p>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Link
                to="/"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Home className="h-4 w-4" /> Back to Home
              </Link>
              <Link
                to="/posts"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                <Search className="h-4 w-4" /> Browse Articles
              </Link>
            </motion.div>

            {/* Go back link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mt-6"
            >
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Go back
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
