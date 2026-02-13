import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container px-4 py-10 sm:px-6 md:py-14">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                <i className="fa-solid fa-feather-pointed text-xs text-white"></i>
              </div>
              <span className="font-display text-lg font-bold gradient-text">Inkwell</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A modern blogging platform for sharing ideas, stories, and knowledge with the world.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">Home</Link>
              <Link to="/posts" className="text-sm text-muted-foreground transition-colors hover:text-primary">Articles</Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Connect</h4>
            <div className="flex gap-2">
              {[
                { icon: "fa-brands fa-x-twitter", href: "#" },
                { icon: "fa-brands fa-github", href: "#" },
                { icon: "fa-brands fa-linkedin-in", href: "#" },
                { icon: "fa-brands fa-youtube", href: "#" },
              ].map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground transition-all hover:border-primary/30 hover:text-primary hover:-translate-y-0.5"
                >
                  <i className={`${s.icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Inkwell. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
