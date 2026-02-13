import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEOHead title="Page Not Found" description="The page you're looking for doesn't exist." />
      <PublicHeader />

      <main className="pt-16">
        <section className="relative flex min-h-[calc(100vh-4rem-200px)] items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full opacity-[0.07]" style={{ background: "var(--gradient-primary)", filter: "blur(100px)" }} />

          <div className="relative mx-auto max-w-2xl px-5 py-20 text-center sm:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="font-display text-[8rem] font-extrabold leading-none sm:text-[10rem]">
                <span className="gradient-text">4</span>
                <span className="text-foreground">0</span>
                <span className="gradient-text">4</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Page Not <span className="gradient-text">Found</span>
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                The page you're looking for doesn't exist or has been moved. Let's get you back on track.
              </p>
              <p className="mt-2 rounded-lg bg-muted/50 px-3 py-1.5 inline-block text-xs text-muted-foreground/70 font-mono">
                {location.pathname}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Home className="h-4 w-4" /> Back to Home
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
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6"
            >
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Go back to previous page
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
