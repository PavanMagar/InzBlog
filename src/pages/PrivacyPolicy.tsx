import { motion } from "framer-motion";
import { Shield, Eye, Database, Cookie, Lock, UserCheck, Mail } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";

const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: [
      "We collect minimal personal information to provide you with a better experience. This may include:",
      "• Name and email address when you leave comments on articles",
      "• Usage data such as pages visited, time spent, and browser information",
      "• Device information including browser type, operating system, and screen resolution",
      "We do not collect any sensitive personal information such as financial data, health information, or government identification numbers.",
    ],
  },
  {
    icon: Database,
    title: "How We Use Your Information",
    content: [
      "The information we collect is used solely for the following purposes:",
      "• To display your comments on articles",
      "• To improve our content and user experience",
      "• To analyze site traffic and understand how our content is used",
      "• To respond to your inquiries when you contact us",
      "We never sell, trade, or transfer your personal information to third parties for marketing purposes.",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies & Tracking",
    content: [
      "Our website may use cookies and similar tracking technologies to enhance your browsing experience.",
      "• Essential cookies: Required for basic site functionality",
      "• Analytics cookies: Help us understand how visitors interact with our content",
      "You can control cookie preferences through your browser settings. Disabling certain cookies may affect site functionality.",
    ],
  },
  {
    icon: Lock,
    title: "Data Security",
    content: [
      "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.",
      "• Data is encrypted in transit using SSL/TLS",
      "• Access to personal data is restricted to authorized personnel only",
      "• We regularly review and update our security practices",
      "While we strive to protect your information, no method of transmission over the internet is 100% secure.",
    ],
  },
  {
    icon: UserCheck,
    title: "Your Rights",
    content: [
      "You have the following rights regarding your personal data:",
      "• Right to access: Request a copy of the data we hold about you",
      "• Right to rectification: Request correction of inaccurate data",
      "• Right to deletion: Request removal of your personal data",
      "• Right to object: Object to certain types of data processing",
      "To exercise any of these rights, please contact us through our Contact page.",
    ],
  },
  {
    icon: Mail,
    title: "Contact Us",
    content: [
      "If you have any questions about this Privacy Policy or how we handle your data, please don't hesitate to reach out.",
      "You can contact us through our Contact page or via the social media channels listed on our website.",
      "We aim to respond to all privacy-related inquiries within 48 hours.",
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead title="Privacy Policy" description="Learn how Inkwell collects, uses, and protects your personal information." />
      <PublicHeader />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full opacity-[0.07]" style={{ background: "var(--gradient-primary)", filter: "blur(100px)" }} />
          <div className="relative mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 md:py-24">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              <motion.div variants={fadeUp} custom={0} className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
                Privacy <span className="gradient-text">Policy</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="mx-auto mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
                Your privacy matters to us. Learn how we collect, use, and protect your information.
              </motion.p>
              <motion.p variants={fadeUp} custom={3} className="mt-3 text-sm text-muted-foreground/70">
                Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-24">
          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-6 sm:p-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">{section.title}</h2>
                </div>
                <div className="space-y-3 pl-[52px]">
                  {section.content.map((line, li) => (
                    <p key={li} className="text-sm leading-relaxed text-muted-foreground">
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
