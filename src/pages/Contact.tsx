import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, User, MessageSquare, FileText, MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const CONTACT_EMAIL = "example@email.com";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

const contactInfo = [
  { icon: Mail, title: "Email Us", desc: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: MapPin, title: "Location", desc: "Remote — Worldwide", href: "#" },
  { icon: Clock, title: "Response Time", desc: "Within 24-48 hours", href: "#" },
];

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
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full opacity-[0.07]" style={{ background: "var(--gradient-primary)", filter: "blur(100px)" }} />
          <div className="relative mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 md:py-24">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              <motion.div variants={fadeUp} custom={0} className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                <Mail className="h-8 w-8 text-white" />
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
                Get in <span className="gradient-text">Touch</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="mx-auto mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
                Have a question, suggestion, or just want to say hello? We'd love to hear from you.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="border-b border-border/40 bg-muted/30">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {contactInfo.map((info, i) => (
                <motion.a
                  key={info.title}
                  href={info.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <info.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">{info.title}</p>
                    <p className="text-xs text-muted-foreground">{info.desc}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Send us a <span className="gradient-text">message</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill out the form below and your email app will open with the message ready to send.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-3.5 w-3.5 text-primary" /> Full Name
                    </Label>
                    <Input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      maxLength={100}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      maxLength={255}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-3.5 w-3.5 text-primary" /> Subject
                  </Label>
                  <Input
                    id="subject"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What is this about?"
                    maxLength={200}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" /> Message
                  </Label>
                  <Textarea
                    id="message"
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    maxLength={2000}
                    className="rounded-xl resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl py-6 text-sm font-semibold text-primary-foreground sm:w-auto sm:px-8"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            </motion.div>

            {/* Side info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h3 className="font-display text-lg font-bold text-foreground">Before you reach out</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Check if your question is already answered in our FAQ section.
                </p>
                <Link
                  to="/faq"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Visit FAQ <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="mt-8 border-t border-border pt-6">
                  <h4 className="font-display text-sm font-bold text-foreground">Connect with us</h4>
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

                <div className="mt-8 border-t border-border pt-6">
                  <h4 className="font-display text-sm font-bold text-foreground">What to expect</h4>
                  <ul className="mt-3 space-y-2">
                    {[
                      "Your email app will open with the message pre-filled",
                      "We typically respond within 24-48 hours",
                      "For urgent matters, reach out via social media",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
