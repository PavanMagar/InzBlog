import { motion } from "framer-motion";
import { Code2, Target, Heart, Globe, Users, BookOpen, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

const stats = [
  { label: "Articles Published", value: "100+", icon: BookOpen },
  { label: "Topics Covered", value: "20+", icon: Code2 },
  { label: "Monthly Readers", value: "10K+", icon: Users },
  { label: "Community Members", value: "5K+", icon: Globe },
];

const values = [
  { icon: Target, title: "Quality First", desc: "Every article is carefully crafted with accurate, up-to-date information and practical examples." },
  { icon: Heart, title: "Community Driven", desc: "We listen to our readers and create content that solves real problems developers face daily." },
  { icon: Zap, title: "Always Learning", desc: "Technology evolves fast. We stay on top of the latest trends to bring you relevant content." },
  { icon: Globe, title: "Open & Accessible", desc: "All our content is free and accessible to developers worldwide, regardless of their experience level." },
];

export default function About() {
  return (
    <>
      <SEOHead title="About Us" description="Learn about Inkwell — a modern platform dedicated to programming tutorials, tech articles, and developer resources." />
      <PublicHeader />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full opacity-[0.07]" style={{ background: "var(--gradient-primary)", filter: "blur(100px)" }} />
          <div className="relative mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 md:py-24">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              <motion.div variants={fadeUp} custom={0} className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                <Code2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">About Inkwell</span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
                Empowering Developers{" "}<br />
                <span className="gradient-text">Worldwide</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Inkwell is a modern blogging platform dedicated to delivering high-quality programming tutorials, tech insights, and developer resources — all completely free.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border/40 bg-muted/30">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-2xl font-extrabold gradient-text">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Our Story</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                Built by developers,{" "}<span className="gradient-text">for developers</span>
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  Inkwell was born from a simple idea: quality programming content should be accessible to everyone. As developers ourselves, we understand the frustration of searching for clear, practical tutorials.
                </p>
                <p>
                  Our mission is to create a platform where beginners can learn the fundamentals and experienced developers can discover advanced techniques — all in one place, all for free.
                </p>
                <p>
                  Every article is carefully crafted with real-world examples, working code snippets, and clear explanations. We believe that the best way to learn is by doing, and our content reflects that philosophy.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="rounded-2xl border border-border bg-[hsl(225,35%,8%)] overflow-hidden">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-destructive/70" />
                  <div className="h-3 w-3 rounded-full bg-accent/70" />
                  <div className="h-3 w-3 rounded-full bg-primary/70" />
                  <span className="ml-auto font-mono text-xs text-white/40">about.ts</span>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed">
                  <p className="text-white/40">// Our mission</p>
                  <p className="mt-2 text-green-400">const inkwell = {"{"}</p>
                  <p className="text-white/70 pl-4">mission: <span className="text-yellow-300">"Empower developers"</span>,</p>
                  <p className="text-white/70 pl-4">content: <span className="text-yellow-300">"Free & open"</span>,</p>
                  <p className="text-white/70 pl-4">quality: <span className="text-yellow-300">"Always improving"</span>,</p>
                  <p className="text-white/70 pl-4">community: <span className="text-yellow-300">"Growing together"</span>,</p>
                  <p className="text-green-400">{"}"}</p>
                  <p className="mt-3 text-primary">█</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="border-t border-border/40 bg-muted/30">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
            <div className="mb-12 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                Our <span className="gradient-text">Values</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                The principles that guide everything we do at Inkwell.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((value, i) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:-translate-y-0.5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/40">
          <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 md:py-20">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Ready to <span className="gradient-text">explore?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Dive into our collection of tutorials, guides, and developer resources.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/posts"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
              >
                Browse Articles <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
