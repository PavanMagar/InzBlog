import { motion } from "framer-motion";
import { ArrowRight, HelpCircle, BookOpen, Shield, CreditCard, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqSections = [
  {
    title: "General Questions",
    icon: HelpCircle,
    items: [
      { q: "What is Inkwell?", a: "Inkwell is a modern platform for programming tutorials, tech articles, and developer resources. We provide high-quality content to help developers of all levels learn and grow." },
      { q: "Is the content free?", a: "Yes! All articles and tutorials on Inkwell are completely free to read. We believe in making knowledge accessible to everyone." },
      { q: "How often is new content published?", a: "We aim to publish fresh content regularly, including tutorials, guides, and tech insights. Follow our social channels to stay updated." },
      { q: "Can I request a topic?", a: "Absolutely! We welcome topic suggestions from our community. Head over to our Contact page and send us your ideas." },
    ],
  },
  {
    title: "Content & Articles",
    icon: BookOpen,
    items: [
      { q: "What topics do you cover?", a: "We cover a wide range of programming topics including JavaScript, Python, React, Node.js, CSS, DevOps, and many more. Check our Categories section for a full list." },
      { q: "Can I share articles?", a: "Yes! Each article has share buttons for popular platforms. You're welcome to share our content with proper attribution." },
      { q: "How do I search for specific topics?", a: "Use the search bar in the header to find articles by keyword. You can also browse by category for organized content discovery." },
      { q: "Do you provide code examples?", a: "Yes, most of our tutorials include working code examples that you can copy and use in your own projects." },
    ],
  },
  {
    title: "Account & Privacy",
    icon: Shield,
    items: [
      { q: "Do I need an account to read articles?", a: "No account is required to read any content on Inkwell. You can browse and read all articles freely." },
      { q: "How do you handle my data?", a: "We take privacy seriously. Please refer to our Privacy Policy page for detailed information on how we collect and use data." },
      { q: "Can I comment on articles?", a: "Yes! You can leave comments on articles by providing your name and email. No account registration is required." },
    ],
  },
  {
    title: "Support & Community",
    icon: Users,
    items: [
      { q: "How can I contact the team?", a: "Visit our Contact page to send us a message. You can also reach us through our social media channels." },
      { q: "Can I contribute articles?", a: "We're always looking for quality contributions! Please reach out through our Contact page with your proposal." },
      { q: "I found an error in an article. How do I report it?", a: "We appreciate your help in keeping our content accurate. Please use the Contact page or report the issue through our social channels." },
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

export default function FAQ() {
  return (
    <>
      <SEOHead title="FAQ" description="Find answers to common questions about Inkwell — programming resources, tutorials, and content sharing platform." />
      <PublicHeader />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full opacity-[0.07]" style={{ background: "var(--gradient-primary)", filter: "blur(100px)" }} />
          <div className="relative mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 md:py-24">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              <motion.h1 variants={fadeUp} custom={0} className="font-display text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
                Frequently Asked{" "}<br />
                <span className="gradient-text">Questions</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={1} className="mx-auto mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
                Find answers to common questions about our programming resources, tutorials, and content sharing platform.
              </motion.p>
              <motion.div variants={fadeUp} custom={2} className="mt-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Still have questions? <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-24">
          <div className="space-y-12">
            {faqSections.map((section, si) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: si * 0.1 }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-bold gradient-text sm:text-2xl">{section.title}</h2>
                </div>

                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <Accordion type="single" collapsible>
                    {section.items.map((item, ii) => (
                      <AccordionItem key={ii} value={`${si}-${ii}`} className="border-b border-border/50 last:border-0">
                        <AccordionTrigger className="px-5 py-4 text-left text-sm font-semibold text-foreground hover:no-underline hover:bg-muted/30 sm:text-base">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/40 bg-muted/30">
          <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 md:py-20">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Still have <span className="gradient-text">questions?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Can't find what you're looking for? Reach out and we'll be happy to help.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
