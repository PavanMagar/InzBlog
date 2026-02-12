import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-10 md:py-14">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                <i className="fa-solid fa-feather-pointed text-xs text-white"></i>
              </div>
              <span className="font-display text-lg font-bold text-foreground">Inkwell</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A modern blogging platform for sharing ideas, stories, and knowledge with the world.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
              <Link to="/posts" className="text-sm text-muted-foreground hover:text-foreground">Articles</Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <i className="fa-brands fa-twitter text-sm"></i>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <i className="fa-brands fa-github text-sm"></i>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <i className="fa-brands fa-linkedin-in text-sm"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Inkwell. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
