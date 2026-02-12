import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function PublicHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/posts?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <i className="fa-solid fa-feather-pointed text-sm text-white"></i>
          </div>
          <span className="font-display text-xl font-bold text-foreground">Inkwell</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/posts" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Articles
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="h-9 w-40 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-56"
                onBlur={() => !query && setSearchOpen(false)}
              />
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Search className="h-4 w-4" />
            </button>
          )}

          <Link
            to="/admin/login"
            className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:block"
          >
            Admin
          </Link>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
              Home
            </Link>
            <Link to="/posts" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
              Articles
            </Link>
            <Link to="/admin/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
