import { Link } from "react-router-dom";
import { Calendar, ArrowUpRight } from "lucide-react";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: string | null;
  categories?: string[];
  compact?: boolean;
}

export function PostCard({ title, slug, excerpt, thumbnailUrl, publishedAt, categories, compact }: PostCardProps) {
  if (compact) {
    return (
      <Link
        to={`/posts/${slug}.html`}
        className="group flex gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/30 hover:-translate-y-0.5"
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="h-16 w-20 shrink-0 rounded-lg object-cover" loading="lazy" />
        ) : (
          <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-muted">
            <i className="fa-solid fa-newspaper text-sm text-muted-foreground/30"></i>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {title}
          </h4>
          {publishedAt && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <time dateTime={publishedAt}>
                {new Date(publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </time>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:-translate-y-1">
      <Link to={`/posts/${slug}.html`} className="flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <i className="fa-solid fa-image text-3xl text-muted-foreground/15"></i>
            </div>
          )}
          {/* Hover arrow */}
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-0.5">
            <ArrowUpRight className="h-4 w-4 text-foreground" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <span key={cat} className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  {cat}
                </span>
              ))}
            </div>
          )}

          <h3 className="mb-2 font-display text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
            {title}
          </h3>

          {excerpt && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/50">
            {publishedAt && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <time dateTime={publishedAt}>
                  {new Date(publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
            )}
            <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Read more →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
