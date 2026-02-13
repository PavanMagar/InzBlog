import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";

const NotFound = () => {
  return (
    <>
      <SEOHead title="Page Not Found" description="The page you're looking for doesn't exist." />
      <PublicHeader />

      <main className="pt-16">
        <section className="flex min-h-[calc(100vh-4rem-200px)] items-center justify-center px-5">
          <div className="max-w-md text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Error 404</p>

            <h1 className="mt-4 font-display text-6xl font-black tracking-tight text-foreground sm:text-7xl">
              Page not found
            </h1>

            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Home className="h-4 w-4" /> Back to Home
              </Link>
              <Link
                to="/posts"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Search className="h-4 w-4" /> Browse Articles
              </Link>
            </div>

            <button
              onClick={() => window.history.back()}
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Go back
            </button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
};

export default NotFound;
