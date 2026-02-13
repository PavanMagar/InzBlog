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
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <i className="fa-solid fa-feather-pointed text-sm text-white"></i>
          </div>
          <span className="font-display text-xl font-bold gradient-text">Inkwell</span>
        </Link>

        {/* Desktop nav — center */}
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { to: "/", label: "Home" },
            { to: "/posts", label: "Articles" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search bar — desktop */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts..."
                className="h-10 w-48 rounded-xl border border-input bg-muted/50 pl-4 pr-10 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:w-64 focus:border-primary/30 focus:bg-background focus:ring-2 focus:ring-ring/20 lg:w-56"
              />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Mobile search toggle */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center md:hidden">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="h-9 w-40 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                onBlur={() => !query && setSearchOpen(false)}
              />
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden">
              <Search className="h-4 w-4" />
            </button>
          )}

          <Link
            to="/admin/login"
            className="hidden rounded-xl px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 md:block"
            style={{ background: "var(--gradient-primary)" }}
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
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
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
