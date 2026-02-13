import { useState } from "react";
import { Share2, Check, ExternalLink, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface SharePostProps {
  title: string;
  slug: string;
}

export function SharePost({ title, slug }: SharePostProps) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/posts/${slug}.html`;
  const text = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n${url}`);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const platforms = [
    { icon: "fa-brands fa-whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${text}%20${encodedUrl}`, accent: "hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/30" },
    { icon: "fa-brands fa-telegram", label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${text}`, accent: "hover:bg-blue-400/10 hover:text-blue-500 hover:border-blue-400/30" },
    { icon: "fa-brands fa-x-twitter fa-lg", label: "X", href: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, accent: "hover:bg-foreground/5 hover:text-foreground hover:border-foreground/20" },
    { icon: "fa-brands fa-instagram", label: "Instagram", href: `https://www.instagram.com/`, accent: "hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/30" },
    { icon: "fa-solid fa-envelope", label: "Email", href: `mailto:?subject=${text}&body=${encodedUrl}`, accent: "hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/30" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Share2 className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <h3 className="font-display text-sm font-bold text-foreground">Share this article</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <a
              key={p.label}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${p.label}`}
              className={`group/btn flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all duration-200 ${p.accent}`}
            >
              <i className={`${p.icon} text-sm`}></i>
            </a>
          ))}

        </div>

        {/* Quick copy URL bar */}
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-xs text-muted-foreground">{url}</span>
          <button onClick={copyLink} className="shrink-0 text-xs font-medium text-primary transition-colors hover:text-primary/80">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
