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
    { to: "/", icon: FileText, label: "Home", desc: "Back to homepage" },
    { to: "/posts", icon: Code2, label: "Articles", desc: "Read all posts" },
    { to: "/posts", icon: LayoutGrid, label: "Categories", desc: "Browse categories" },
  ];

  return (
    <>
      {/* Fixed wrapper — centered floating bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-transform duration-300 pointer-events-none"
        style={{ transform: visible ? "translateY(0)" : "translateY(calc(-100% - 16px))" }}
      >
        <div className="w-full max-w-4xl px-4 pt-3 pointer-events-auto">
          {/* Header bar */}
          <header className="relative z-20 flex h-14 items-center justify-between rounded-2xl border border-border/50 bg-background/85 px-4 shadow-sm backdrop-blur-xl">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                <i className="fa-solid fa-feather-pointed text-xs text-white"></i>
              </div>
              <span className="font-display text-lg font-bold gradient-text">Inkwell</span>
            </Link>

            {/* Desktop nav + search */}
            <div className="hidden items-center gap-1 md:flex">
              {[
                { to: "/", label: "Home" },
                { to: "/posts", label: "Articles" },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <form onSubmit={handleSearch} className="relative ml-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="h-9 w-44 rounded-xl border border-input bg-muted/50 pl-3.5 pr-9 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/30 focus:bg-background focus:ring-2 focus:ring-ring/20"
                />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  <Search className="h-3 w-3" />
                </button>
              </form>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted md:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </header>

          {/* Mobile dropdown — appears to slide from behind the header */}
          <div
            className={`md:hidden relative z-10 overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] origin-top ${
              menuOpen
                ? "max-h-[500px] opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-3"
            }`}
            style={{ marginTop: "-12px", paddingTop: "12px" }}
          >
            <div className="rounded-b-2xl border border-t-0 border-border/50 bg-background/95 backdrop-blur-xl px-4 pb-5 pt-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="h-11 w-full rounded-xl border border-input bg-muted/50 pl-4 pr-11 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/30 focus:ring-2 focus:ring-ring/20"
                />
                <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  <Search className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Menu items */}
              <nav className="flex flex-col gap-0.5">
                {menuItems.map((item, i) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3.5 rounded-xl px-3 py-3 transition-all hover:bg-muted"
                    style={{
                      transitionDelay: menuOpen ? `${i * 50}ms` : "0ms",
                      opacity: menuOpen ? 1 : 0,
                      transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
                      transitionDuration: "300ms",
                    }}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </nav>

              {/* Bottom buttons */}
              <div className="mt-3 flex gap-2.5 border-t border-border/40 pt-3">
                <a href="#" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <Info className="h-3.5 w-3.5" /> About
                </a>
                <a href="#" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <Mail className="h-3.5 w-3.5" /> Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
