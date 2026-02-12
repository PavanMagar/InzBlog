import { Link } from "react-router-dom";
import { PenLine } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <Link to="/" className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-bold">Inkwell</span>
          </Link>
          <nav className="flex gap-6">
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
