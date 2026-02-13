import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function PublicFooter() {
  const site = useSiteSettings();

  const socialLinks = [
    { icon: "fa-brands fa-youtube", href: site.social_facebook || "#" },
    { icon: "fa-brands fa-telegram", href: "#" },
    { icon: "fa-brands fa-instagram", href: site.social_instagram || "#" },
    { icon: "fa-brands fa-github", href: "#" },
    ...(site.social_twitter ? [{ icon: "fa-brands fa-x-twitter", href: site.social_twitter }] : []),
    ...(site.social_linkedin ? [{ icon: "fa-brands fa-linkedin", href: site.social_linkedin }] : []),
  ];

  return (
    <footer className="bg-[hsl(220,25%,12%)] text-[hsl(220,15%,70%)]">
      <div className="container px-4 py-12 sm:px-6 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              {site.site_icon_url ? (
                <img src={site.site_icon_url} alt={site.site_title} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                  <i className="fa-solid fa-feather-pointed text-xs text-white"></i>
                </div>
              )}
              <span className="font-display text-lg font-bold text-white">{site.site_title}</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              {site.site_description || "Exploring the world of programming and development through providing the thoughtful content."}
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(220,15%,50%)] transition-colors hover:text-white"
                >
                  <i className={`${s.icon} text-lg`}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-white">Quick Links</h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/" className="text-sm transition-colors hover:text-white">Home</Link>
              <Link to="/posts" className="text-sm transition-colors hover:text-white">Posts</Link>
              <Link to="/posts" className="text-sm transition-colors hover:text-white">Categories</Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-white">Resources</h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/faq" className="text-sm transition-colors hover:text-white">FAQ</Link>
              <Link to="/privacy-policy" className="text-sm transition-colors hover:text-white">Privacy Policy</Link>
              <Link to="/disclaimer" className="text-sm transition-colors hover:text-white">Disclaimer</Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-white">Support</h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/about" className="text-sm transition-colors hover:text-white">About Us</Link>
              <Link to="/contact" className="text-sm transition-colors hover:text-white">Contact Us</Link>
              <Link to="/faq" className="text-sm transition-colors hover:text-white">Help Center</Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-[hsl(220,20%,20%)] pt-6">
          <p className="text-center text-sm text-[hsl(220,15%,45%)]">
            © {new Date().getFullYear()} {site.site_title}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
