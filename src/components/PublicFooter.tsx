import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="bg-[hsl(220,25%,12%)] text-[hsl(220,15%,70%)]">
      <div className="container px-4 py-12 sm:px-6 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                <i className="fa-solid fa-feather-pointed text-xs text-white"></i>
              </div>
              <span className="font-display text-lg font-bold text-white">Inkwell</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              Exploring the world of programming and development through providing the thoughtful content.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: "fa-brands fa-youtube", href: "#" },
                { icon: "fa-brands fa-telegram", href: "#" },
                { icon: "fa-brands fa-instagram", href: "#" },
                { icon: "fa-brands fa-github", href: "#" },
              ].map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  className="text-[hsl(220,15%,50%)] transition-colors hover:text-white"
                >
                  <i className={`${s.icon} text-lg`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-white">Quick Links</h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/" className="text-sm transition-colors hover:text-white">Home</Link>
              <Link to="/posts" className="text-sm transition-colors hover:text-white">Posts</Link>
              <Link to="/posts" className="text-sm transition-colors hover:text-white">Categories</Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-white">Resources</h4>
            <nav className="flex flex-col gap-2.5">
              <a href="#" className="text-sm transition-colors hover:text-white">FAQ</a>
              <a href="#" className="text-sm transition-colors hover:text-white">Privacy Policy</a>
              <a href="#" className="text-sm transition-colors hover:text-white">Disclaimer</a>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-white">Support</h4>
            <nav className="flex flex-col gap-2.5">
              <a href="#" className="text-sm transition-colors hover:text-white">About</a>
              <a href="#" className="text-sm transition-colors hover:text-white">Contact</a>
              <a href="#" className="text-sm transition-colors hover:text-white">Report Issue</a>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-[hsl(220,20%,20%)] pt-6">
          <p className="text-center text-sm text-[hsl(220,15%,45%)]">
            © {new Date().getFullYear()} Inkwell. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
