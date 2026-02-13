import { Link } from "react-router-dom";
import { Search, Menu, X, FileText, Code2, LayoutGrid, Info, Mail } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y < 50 || y < lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/posts?q=${encodeURIComponent(query.trim())}`);
      setMenuOpen(false);
      setQuery("");
    }
  };

  const menuItems = [
    { to: "/posts", icon: FileText, label: "Posts", desc: "Articles & tutorials" },
    { to: "/posts", icon: Code2, label: "Projects", desc: "Explore all projects" },
    { to: "/posts", icon: LayoutGrid, label: "Categories", desc: "Browse categories" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
      style={{ transform: visible ? "translateY(0)" : "translateY(-100%)" }}
    >
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
              <i className="fa-solid fa-feather-pointed text-sm text-white"></i>
            </div>
            <span className="font-display text-xl font-bold gradient-text">Inkwell</span>
          </Link>

          {/* Desktop right side: nav + search */}
          <div className="hidden items-center gap-1 md:flex">
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
            <form onSubmit={handleSearch} className="relative ml-2">
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu — slide down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-b border-border/40 bg-background/95 backdrop-blur-xl px-4 pb-5 pt-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative mb-5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="h-12 w-full rounded-xl border border-input bg-muted/50 pl-4 pr-12 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/30 focus:ring-2 focus:ring-ring/20"
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Menu items */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </Link>
            ))}
          </nav>

          {/* Bottom buttons */}
          <div className="mt-4 flex gap-3 border-t border-border/40 pt-4">
            <a href="#" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Info className="h-4 w-4" /> About
            </a>
            <a href="#" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Mail className="h-4 w-4" /> Contact
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
