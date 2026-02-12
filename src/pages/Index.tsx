import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code2, BookOpen, Cpu, Layers, ChevronDown } from "lucide-react";
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

const INITIAL_TOPICS = 6;

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

  const visibleTopics = showAllTopics ? categories : categories.slice(0, INITIAL_TOPICS);
  const topicIcons = [Code2, BookOpen, Cpu, Layers];

  return (
    <>
      <SEOHead
        title="Inkwell — Code, Tutorials & Tech Resources"
        description="Discover in-depth coding tutorials, programming guides, tech resources, and developer insights. Built for curious developers."
      />
      <PublicHeader />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `linear-gradient(hsl(217, 91%, 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(217, 91%, 60%) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }} />
          {/* Glow orbs */}
          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-accent/20 blur-[100px]" />

          <div className="container relative z-10 px-4 py-20 sm:py-28 md:py-36 lg:py-44">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-xs font-medium tracking-wide text-primary-foreground/80">CODING • TUTORIALS • TECH</span>
                </div>
                <h1 className="mb-6 font-display text-3xl font-bold leading-[1.1] text-primary-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                  Build Better.{" "}
                  <span className="gradient-text">Learn Faster.</span>
                </h1>
                <p className="mb-8 max-w-lg text-base leading-relaxed text-primary-foreground/50 sm:text-lg">
                  In-depth tutorials, real-world code examples, and curated resources for developers who want to level up their craft.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/posts"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-medium text-primary-foreground shadow-lg transition-all hover:scale-[1.02] hover:shadow-[var(--shadow-glow)]"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Explore Articles <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#latest"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/15 px-7 py-3.5 font-medium text-primary-foreground/70 backdrop-blur-sm transition-all hover:border-primary-foreground/30 hover:text-primary-foreground"
                  >
                    Latest Posts
                  </a>
                </div>
              </motion.div>

              {/* Code-themed decorative card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden lg:block"
              >
                <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive/70" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
                    <div className="h-3 w-3 rounded-full bg-green-400/70" />
                    <span className="ml-2 text-xs text-primary-foreground/30 font-mono">inkwell.tsx</span>
                  </div>
                  <pre className="font-mono text-sm leading-relaxed text-primary-foreground/60">
                    <code>
{`const developer = {
  learn: () => "tutorials",
  build: () => "projects",
  grow:  () => "community"
};

// Start your journey
developer.learn();`}
                    </code>
                  </pre>
                </div>
              </motion.div>
            </div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {[
                { label: "Articles", value: `${recentPosts.length}+`, icon: "fa-solid fa-file-code" },
                { label: "Topics", value: `${categories.length}+`, icon: "fa-solid fa-tags" },
                { label: "Free Access", value: "100%", icon: "fa-solid fa-unlock" },
                { label: "Open Source", value: "Yes", icon: "fa-brands fa-github" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 px-4 py-3 text-center backdrop-blur-sm"
                >
                  <i className={`${stat.icon} mb-1 text-primary/80`} />
                  <div className="font-display text-lg font-bold text-primary-foreground">{stat.value}</div>
                  <div className="text-xs text-primary-foreground/40">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Latest Articles */}
        <section id="latest" className="container px-4 py-14 md:py-20">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">LATEST</span>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Fresh Off the Press</h2>
            <p className="mt-2 text-sm text-muted-foreground">The newest tutorials and articles, hot off the keyboard</p>
          </div>

          {recentPosts.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recentPosts.map((post) => (
                  <PostCard key={post.id} {...post} publishedAt={post.published_at} thumbnailUrl={post.thumbnail_url} />
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                <Link
                  to="/posts"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  View All Articles <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-subtle)" }}>
                <i className="fa-solid fa-pen-nib text-2xl text-primary" />
              </div>
              <h3 className="mb-2 font-display text-xl font-bold text-foreground">No articles yet</h3>
              <p className="text-muted-foreground">Content is coming soon. Stay tuned!</p>
            </div>
          )}
        </section>

        {/* Explore Topics */}
        {categories.length > 0 && (
          <section className="border-t border-border" style={{ background: "var(--gradient-subtle)" }}>
            <div className="container px-4 py-14 md:py-20">
              <div className="mb-10 text-center">
                <span className="mb-3 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">TOPICS</span>
                <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Explore Topics</h2>
                <p className="mt-2 text-sm text-muted-foreground">Browse articles by the topics you care about</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleTopics.map((cat, i) => {
                  const Icon = topicIcons[i % topicIcons.length];
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={`/posts?category=${encodeURIComponent(cat.slug)}`}
                        className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary">{cat.name}</h3>
                          <p className="text-xs text-muted-foreground">Browse articles →</p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              {categories.length > INITIAL_TOPICS && !showAllTopics && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setShowAllTopics(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)]"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Show More Topics
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Connect With Us */}
        <section className="border-t border-border">
          <div className="container px-4 py-14 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">COMMUNITY</span>
              <h2 className="mb-3 font-display text-2xl font-bold text-foreground sm:text-3xl">Connect With Us</h2>
              <p className="mb-8 text-sm text-muted-foreground">Follow us on social media for the latest updates, tutorials, and developer tips</p>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { icon: "fa-brands fa-instagram", label: "Instagram", href: "#", color: "from-pink-500 to-purple-500" },
                  { icon: "fa-brands fa-whatsapp", label: "WhatsApp", href: "#", color: "from-green-500 to-emerald-500" },
                  { icon: "fa-brands fa-telegram", label: "Telegram", href: "#", color: "from-blue-400 to-cyan-400" },
                  { icon: "fa-brands fa-x-twitter", label: "X (Twitter)", href: "#", color: "from-gray-600 to-gray-800" },
                  { icon: "fa-brands fa-github", label: "GitHub", href: "#", color: "from-gray-700 to-gray-900" },
                  { icon: "fa-brands fa-youtube", label: "YouTube", href: "#", color: "from-red-500 to-red-600" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] w-28"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${social.color} text-white shadow-md transition-transform group-hover:scale-110`}>
                      <i className={`${social.icon} text-lg`} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{social.label}</span>
                  </a>
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
