import { Link } from "react-router-dom";
import { PenLine, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function PublicHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
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
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <PenLine className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">Inkwell</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/posts" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Articles
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="h-9 w-48 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
            className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
