import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: "website" | "article";
  publishedAt?: string;
}

export function SEOHead({ title, description, ogImage, canonicalUrl, type = "website", publishedAt }: SEOHeadProps) {
  const fullTitle = `${title} | InvizHer`;
  const desc = description || "A modern blogging platform for sharing ideas and stories.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {type === "article" && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
