import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code2, BookOpen, Cpu, Globe, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { PostCard } from "@/components/PostCard";
import { SEOHead } from "@/components/SEOHead";

interface PostWithCategories {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  categories: string[];
}

const TOPICS_INITIAL = 6;

const topicIcons: Record<string, string> = {
  javascript: "fa-brands fa-js",
  python: "fa-brands fa-python",
  react: "fa-brands fa-react",
  css: "fa-brands fa-css3-alt",
  html: "fa-brands fa-html5",
  node: "fa-brands fa-node-js",
  git: "fa-brands fa-git-alt",
  docker: "fa-brands fa-docker",
  linux: "fa-brands fa-linux",
  aws: "fa-brands fa-aws",
};

function getTopicIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(topicIcons)) {
    if (lower.includes(key)) return icon;
  }
  const fallbacks = [
    "fa-solid fa-code",
    "fa-solid fa-terminal",
    "fa-solid fa-microchip",
    "fa-solid fa-database",
    "fa-solid fa-server",
    "fa-solid fa-globe",
    "fa-solid fa-bolt",
    "fa-solid fa-cube",
  ];
  return fallbacks[name.charCodeAt(0) % fallbacks.length];
}

const topicColors = [
  "from-blue-500/15 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40",
  "from-purple-500/15 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40",
  "from-emerald-500/15 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40",
  "from-orange-500/15 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40",
  "from-rose-500/15 to-rose-600/5 border-rose-500/20 hover:border-rose-500/40",
  "from-cyan-500/15 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/40",
  "from-amber-500/15 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40",
  "from-indigo-500/15 to-indigo-600/5 border-indigo-500/20 hover:border-indigo-500/40",
];

export default function Index() {
  const [recentPosts, setRecentPosts] = useState<PostWithCategories[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: posts } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, thumbnail_url, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(6);

      if (posts) {
        const postsWithCats = await Promise.all(
          posts.map(async (post) => {
            const { data: pc } = await supabase
              .from("post_categories")
              .select("category_id, categories(name)")
              .eq("post_id", post.id);
            return {
              ...post,
              categories: pc?.map((p: any) => p.categories?.name).filter(Boolean) ?? [],
            };
          })
        );
        setRecentPosts(postsWithCats);
      }

      const { data: cats } = await supabase.from("categories").select("id, name, slug").order("name");
      if (cats) setCategories(cats);
    };
    fetchData();
  }, []);

  const visibleTopics = showAllTopics ? categories : categories.slice(0, TOPICS_INITIAL);

  return (
    <>
      <SEOHead title="Home" description="Inkwell — A modern platform for coding tutorials, programming resources, tech articles and developer knowledge." />
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(hsl(217, 91%, 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(217, 91%, 60%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
          {/* Floating orbs */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

          <div className="container relative z-10 px-4 py-16 sm:py-24 md:py-32 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/10 bg-primary-foreground/5 px-4 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                  </span>
                  <span className="text-xs font-medium tracking-wide text-primary-foreground/70">DEVELOPER KNOWLEDGE HUB</span>
                </div>

                <h1 className="mb-6 font-display text-3xl font-bold leading-[1.1] text-primary-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                  Code. Learn.{" "}
                  <span className="gradient-text">Build.</span>
                </h1>
                <p className="mb-8 max-w-lg text-base leading-relaxed text-primary-foreground/55 sm:text-lg">
                  Explore in-depth coding tutorials, programming guides, and tech resources. Written by developers, for developers.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/posts"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-medium text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Browse Articles <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/posts?category="
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 px-6 py-3.5 font-medium text-primary-foreground/80 transition-all hover:bg-primary-foreground/10"
                  >
                    Explore Topics
                  </Link>
                </div>
              </motion.div>

              {/* Right side — feature cards */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="hidden lg:block"
              >
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <Code2 className="h-6 w-6" />, title: "Coding Tutorials", desc: "Step-by-step guides" },
                    { icon: <BookOpen className="h-6 w-6" />, title: "Tech Articles", desc: "Deep-dive analysis" },
                    { icon: <Cpu className="h-6 w-6" />, title: "Dev Resources", desc: "Tools & libraries" },
                    { icon: <Globe className="h-6 w-6" />, title: "Web & More", desc: "Modern tech stack" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 backdrop-blur-sm transition-all hover:border-primary-foreground/20 hover:bg-primary-foreground/8"
                    >
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-primary" style={{ background: "var(--gradient-subtle)" }}>
                        {item.icon}
                      </div>
                      <h3 className="mb-1 font-display text-sm font-semibold text-primary-foreground">{item.title}</h3>
                      <p className="text-xs text-primary-foreground/50">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Latest Articles */}
        {recentPosts.length > 0 && (
          <section className="container px-4 py-14 md:py-20 lg:px-8">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Latest Articles</h2>
                <p className="mt-2 text-sm text-muted-foreground">Fresh perspectives and tutorials</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <PostCard {...post} publishedAt={post.published_at} thumbnailUrl={post.thumbnail_url} />
                </motion.div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                to="/posts"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5"
              >
                View All Articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Explore Topics */}
        {categories.length > 0 && (
          <section className="border-t border-border" style={{ background: "var(--gradient-subtle)" }}>
            <div className="container px-4 py-14 md:py-20 lg:px-8">
              <div className="mb-10 text-center">
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Explore Topics</h2>
                <p className="mt-2 text-sm text-muted-foreground">Browse articles by technology and category</p>
              </div>
              <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleTopics.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <Link
                      to={`/posts?category=${encodeURIComponent(cat.slug)}`}
                      className={`group flex items-center gap-4 rounded-2xl border bg-gradient-to-br p-4 transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 ${topicColors[i % topicColors.length]}`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card/80 text-lg text-foreground shadow-sm">
                        <i className={getTopicIcon(cat.name)}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-sm font-semibold text-foreground">{cat.name}</h3>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </motion.div>
                ))}
              </div>
              {categories.length > TOPICS_INITIAL && !showAllTopics && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setShowAllTopics(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:shadow-[var(--shadow-card)]"
                  >
                    Load More Topics <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Connect With Us */}
        <section className="border-t border-border">
          <div className="container px-4 py-14 md:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                <i className="fa-solid fa-satellite-dish text-xl text-white"></i>
              </div>
              <h2 className="mb-3 font-display text-2xl font-bold text-foreground sm:text-3xl">Connect With Us</h2>
              <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                Stay updated with the latest tutorials, tech news, and coding resources. Follow us on social media.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: "fa-brands fa-instagram", label: "Instagram", href: "#" },
                  { icon: "fa-brands fa-x-twitter", label: "X / Twitter", href: "#" },
                  { icon: "fa-brands fa-github", label: "GitHub", href: "#" },
                  { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", href: "#" },
                  { icon: "fa-brands fa-youtube", label: "YouTube", href: "#" },
                  { icon: "fa-brands fa-telegram", label: "Telegram", href: "#" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 hover:border-primary/30"
                  >
                    <i className={`${s.icon} text-base text-muted-foreground transition-colors group-hover:text-primary`}></i>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Empty state */}
        {recentPosts.length === 0 && (
          <section className="container px-4 py-24 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-subtle)" }}>
              <i className="fa-solid fa-pen-nib text-2xl text-primary"></i>
            </div>
            <h2 className="mb-3 mt-6 font-display text-2xl font-bold text-foreground">No articles yet</h2>
            <p className="text-muted-foreground">Content is coming soon. Stay tuned!</p>
          </section>
        )}
      </main>

      <PublicFooter />
    </>
  );
}
