import { Link } from "react-router-dom";
import { Calendar, ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: string | null;
  categories?: string[];
}

export function ProjectCard({ title, slug, excerpt, thumbnailUrl, publishedAt, categories }: ProjectCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/posts/${slug}.html`} className="flex flex-col h-full p-5">
        {/* Thumbnail */}
        <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <i className="fa-solid fa-diagram-project text-3xl text-muted-foreground/15"></i>
            </div>
          )}
          {/* Hover arrow */}
          <div className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100">
            <ArrowUpRight className="h-3.5 w-3.5 text-foreground" />
          </div>
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="mb-2 font-display text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
        )}

        {/* Date */}
        {publishedAt && (
          <div className="mt-auto flex items-center gap-1.5 pt-3 border-t border-border/50 text-xs text-muted-foreground">
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
      </Link>
    </article>
  );
}
