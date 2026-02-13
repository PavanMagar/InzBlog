import { motion } from "framer-motion";
import { AlertTriangle, FileWarning, Scale, ExternalLink, BookOpen, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SEOHead } from "@/components/SEOHead";

const sections = [
  {
    icon: Info,
    title: "General Information",
    content: [
      "The information provided on Inkwell is for general informational and educational purposes only. While we strive to keep the content accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information.",
      "Any reliance you place on such information is strictly at your own risk. We recommend verifying critical information from official documentation and authoritative sources before implementing in production environments.",
    ],
  },
  {
    icon: FileWarning,
    title: "Code & Technical Content",
    content: [
      "Code examples, tutorials, and technical guides provided on this platform are intended for educational purposes. They may not be production-ready and should be thoroughly tested before use in any live environment.",
      "• Code snippets may not cover all edge cases or security considerations",
      "• Library versions and APIs referenced may change over time",
      "• We recommend following official documentation for critical implementations",
      "• Always review and test code in your specific context before deployment",
    ],
  },
  {
    icon: ExternalLink,
    title: "External Links",
    content: [
      "Inkwell may contain links to external websites or resources that are not maintained or controlled by us. We do not guarantee the accuracy, relevance, or completeness of any information on these external sites.",
      "The inclusion of any links does not necessarily imply a recommendation or endorsement of the views expressed within them. We have no control over the content, privacy policies, or practices of third-party websites.",
    ],
  },
  {
    icon: Scale,
    title: "Limitation of Liability",
    content: [
      "In no event shall Inkwell or its contributors be liable for any loss or damage, including without limitation, indirect or consequential loss or damage, arising from the use of this website or its content.",
      "This includes, but is not limited to, damages from loss of data, revenue, profits, or any other intangible losses resulting from the use or inability to use our content and services.",
    ],
  },
  {
    icon: BookOpen,
    title: "Intellectual Property",
    content: [
      "All original content published on Inkwell, including articles, tutorials, graphics, and code examples, is the intellectual property of Inkwell unless otherwise stated.",
      "• You may share our content with proper attribution and a link back",
      "• Reproducing our content without permission is prohibited",
      "• Third-party content and trademarks belong to their respective owners",
      "• Code examples may be used freely unless otherwise noted",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Changes to This Disclaimer",
    content: [
      "We reserve the right to update or modify this disclaimer at any time without prior notice. Changes will be effective immediately upon posting to the website.",
      "We encourage you to review this page periodically to stay informed about any updates. Continued use of the website after changes constitutes acceptance of the modified disclaimer.",
    ],
  },
];

export default function Disclaimer() {
  return (
    <>
      <SEOHead title="Disclaimer" description="Read the disclaimer for Inkwell — limitations, liability, and usage terms for our content." />
      <PublicHeader />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full opacity-[0.07]" style={{ background: "var(--gradient-primary)", filter: "blur(100px)" }} />
          <div className="relative mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h1 className="font-display text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
                <span className="gradient-text">Disclaimer</span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
                Important information about the use of content and services provided on Inkwell.
              </p>
              <p className="mt-3 text-sm text-muted-foreground/70">
                Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
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

        {/* CTA */}
        <section className="border-t border-border/40 bg-muted/30">
          <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 md:py-20">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Have <span className="gradient-text">questions?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              If you have any concerns about this disclaimer, feel free to reach out.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
