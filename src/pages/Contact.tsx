import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, User, MessageSquare, FileText, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CONTACT_EMAIL = "example@email.com";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject || "Contact from Inkwell")}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <>
      <SEOHead title="Contact Us" description="Get in touch with the Inkwell team — we'd love to hear from you." />
      <PublicHeader />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full opacity-[0.07]" style={{ background: "var(--gradient-primary)", filter: "blur(100px)" }} />
          <div className="relative mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">We'd love to hear from you</span>
              </div>
              <h1 className="font-display text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
                Get in <span className="gradient-text">Touch</span>
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
                Have a question, suggestion, or just want to say hello? Drop us a message below.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form Section */}
        <section className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-5">
            {/* Form — takes 3 cols */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                {/* Gradient top bar */}
                <div className="mb-6 h-1.5 w-20 rounded-full" style={{ background: "var(--gradient-primary)" }} />
                <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                  Send a <span className="gradient-text">Message</span>
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Your email app will open with the message ready to send.
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <User className="h-3.5 w-3.5 text-primary" /> Full Name
                      </Label>
                      <Input
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        maxLength={100}
                        className="h-12 rounded-xl border-border/60 bg-muted/30 text-sm transition-all focus:bg-background focus:shadow-md focus:shadow-primary/5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-primary" /> Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        maxLength={255}
                        className="h-12 rounded-xl border-border/60 bg-muted/30 text-sm transition-all focus:bg-background focus:shadow-md focus:shadow-primary/5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <FileText className="h-3.5 w-3.5 text-primary" /> Subject
                    </Label>
                    <Input
                      id="subject"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="What is this about?"
                      maxLength={200}
                      className="h-12 rounded-xl border-border/60 bg-muted/30 text-sm transition-all focus:bg-background focus:shadow-md focus:shadow-primary/5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" /> Message
                    </Label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your message here..."
                      maxLength={2000}
                      className="rounded-xl border-border/60 bg-muted/30 text-sm resize-none transition-all focus:bg-background focus:shadow-md focus:shadow-primary/5"
                    />
                  </div>

                  <button
                    type="submit"
                    className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] sm:w-auto"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /> Send Message
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Sidebar — takes 2 cols */}
            <motion.div
              className="lg:col-span-2 space-y-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              {/* FAQ card */}
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="mb-4 h-1.5 w-14 rounded-full" style={{ background: "var(--gradient-primary)" }} />
                <h3 className="font-display text-base font-bold text-foreground">Before you reach out</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Check if your question is already answered in our FAQ section.
                </p>
                <Link
                  to="/faq"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Visit FAQ <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Social card */}
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="font-display text-base font-bold text-foreground">Connect with us</h3>
                <p className="mt-2 text-sm text-muted-foreground">Follow us for updates and behind-the-scenes content.</p>
                <div className="mt-4 flex gap-3">
                  {[
                    { icon: "fa-brands fa-youtube", href: "#" },
                    { icon: "fa-brands fa-telegram", href: "#" },
                    { icon: "fa-brands fa-instagram", href: "#" },
                    { icon: "fa-brands fa-github", href: "#" },
                  ].map((s) => (
                    <a
                      key={s.icon}
                      href={s.href}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:border-primary/30 hover:text-primary hover:-translate-y-0.5"
                    >
                      <i className={`${s.icon} text-base`}></i>
                    </a>
                  ))}
                </div>
              </div>

              {/* Expectations card */}
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="font-display text-base font-bold text-foreground">What to expect</h3>
                <ul className="mt-3 space-y-2.5">
                  {[
                    "Email app opens with message pre-filled",
                    "We typically respond within 24-48 hours",
                    "For urgent matters, use social media",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
