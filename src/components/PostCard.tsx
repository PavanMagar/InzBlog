import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: string | null;
  categories?: string[];
}

export function PostCard({ title, slug, excerpt, thumbnailUrl, publishedAt, categories }: PostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]"
    >
      <Link to={`/posts/${slug}.html`}>
        {thumbnailUrl && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-5">
          {categories && categories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span key={cat} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {cat}
                </span>
              ))}
            </div>
          )}
          <h3 className="mb-2 font-display text-lg font-semibold leading-tight text-card-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
          {excerpt && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{excerpt}</p>
          )}
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
        </div>
      </Link>
    </motion.article>
  );
}
