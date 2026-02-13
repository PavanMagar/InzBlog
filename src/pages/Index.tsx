import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Terminal, Sparkles, BookOpen, Zap, Code2 } from "lucide-react";
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

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <>
      <SEOHead title="Home" description="Inkwell — A modern platform for coding tutorials, programming resources, tech articles and developer knowledge." />
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-background">
          <div className="container relative px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 md:pb-24 md:pt-20 lg:pb-28">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                {/* Greeting badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{greeting} Buddy!</span>
                  <span className="text-sm">✨</span>
                </div>

                <h1 className="mb-6 font-display text-4xl font-extrabold leading-[1.1] text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                  Code. Create.{" "}
                  <br />
                  <span className="gradient-text">Innovate.</span>
                </h1>

                <p className="mb-8 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Your gateway to programming tutorials, innovative projects, and cutting-edge development resources.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/posts"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Browse Posts <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/posts?category="
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
                  >
                    <BookOpen className="h-4 w-4" /> Categories
                  </Link>
                </div>
              </motion.div>

              {/* Right — terminal card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="hidden lg:block"
              >
                <div className="rounded-2xl border border-border bg-[hsl(225,35%,8%)] p-0 shadow-[var(--shadow-elevated)] overflow-hidden">
                  {/* Terminal top bar */}
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <span className="font-mono text-xs text-white/40">inkwell.sh</span>
                  </div>
                  {/* Terminal content */}
                  <div className="p-6 font-mono text-sm leading-relaxed">
                    <p className="text-green-400">→ ~ inkwell</p>
                    <p className="mt-3 text-white/70">Welcome to Inkwell Blog Platform</p>
                    <p className="mt-1 text-white/40">Discover tutorials, guides & resources...</p>
                    <p className="mt-4 text-white/50">Enter your search query...</p>
                    <p className="mt-2 text-white/30">Press <span className="rounded border border-white/20 px-1.5 py-0.5 text-xs text-white/60">Enter</span> to search</p>
                    <p className="mt-4 text-primary">█</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats row */}
        <section className="border-y border-border/40">
          <div className="container px-4 py-6 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 md:gap-20">
              {[
                { value: "100+", label: "Articles", color: "text-primary" },
                { value: "Open", label: "Source", color: "text-accent" },
                { value: "Fast", label: "Performance", color: "text-primary" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`font-display text-xl font-extrabold ${stat.color} sm:text-2xl`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Articles */}
        {recentPosts.length > 0 && (
          <section className="container px-4 py-14 sm:px-6 md:py-20">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Fresh Content</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                Latest <span className="gradient-text">Articles</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">Fresh perspectives, tutorials, and developer insights</p>
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
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:-translate-y-0.5"
              >
                View All Articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Explore Topics */}
        {categories.length > 0 && (
          <section className="border-t border-border/40">
            <div className="container px-4 py-16 sm:px-6 md:py-24">
              <div className="mb-12 text-center">
                <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                  <Code2 className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">Browse by Topic</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                  Explore <span className="gradient-text">Topics</span>
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  Dive into curated collections organized by technology
                </p>
              </div>

              <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleTopics.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <Link
                      to={`/posts?category=${encodeURIComponent(cat.slug)}`}
                      className="group flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <i className={getTopicIcon(cat.name)}></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-sm font-bold text-foreground">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground">Explore articles →</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {categories.length > TOPICS_INITIAL && !showAllTopics && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => setShowAllTopics(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:-translate-y-0.5"
                  >
                    Show All Topics
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                      {categories.length - TOPICS_INITIAL}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Connect With Us */}
        <section className="border-t border-border/40">
          <div className="container px-4 py-16 sm:px-6 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
                  <i className="fa-solid fa-satellite-dish text-xl text-primary"></i>
                </div>
                <h2 className="mb-3 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                  Let's <span className="gradient-text">Connect</span>
                </h2>
                <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Follow us for the latest tutorials, tech insights, and developer resources.
                </p>
              </motion.div>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {[
                  { icon: "fa-brands fa-instagram", label: "Instagram", href: "#" },
                  { icon: "fa-brands fa-x-twitter", label: "Twitter", href: "#" },
                  { icon: "fa-brands fa-github", label: "GitHub", href: "#" },
                  { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", href: "#" },
                  { icon: "fa-brands fa-youtube", label: "YouTube", href: "#" },
                  { icon: "fa-brands fa-telegram", label: "Telegram", href: "#" },
                ].map((s, i) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <i className={`${s.icon} text-base`}></i>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{s.label}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
