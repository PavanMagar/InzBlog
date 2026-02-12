import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
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
    { icon: "fa-brands fa-whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${text}%20${encodedUrl}`, color: "hover:text-green-500" },
    { icon: "fa-brands fa-telegram", label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${text}`, color: "hover:text-blue-400" },
    { icon: "fa-brands fa-x-twitter", label: "X", href: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, color: "hover:text-foreground" },
    { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, color: "hover:text-blue-600" },
    { icon: "fa-solid fa-envelope", label: "Email", href: `mailto:?subject=${text}&body=${encodedUrl}`, color: "hover:text-orange-500" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center gap-2">
        <Share2 className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">Share this article</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <a
            key={p.label}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${p.label}`}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:border-primary/20 hover:shadow-sm ${p.color}`}
          >
            <i className={`${p.icon} text-sm`}></i>
          </a>
        ))}
        <button
          onClick={copyLink}
          aria-label="Copy link"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:border-primary/20 hover:text-primary hover:shadow-sm"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
