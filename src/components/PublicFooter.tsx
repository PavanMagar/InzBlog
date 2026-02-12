import { Link } from "react-router-dom";
import { PenLine } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-10 md:py-12">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
              <PenLine className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Inkwell</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
            <Link to="/posts" className="text-sm text-muted-foreground hover:text-foreground">Articles</Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Inkwell. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
