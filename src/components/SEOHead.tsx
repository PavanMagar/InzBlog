import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface SEOHeadProps {
  title: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: "website" | "article";
  publishedAt?: string;
}

export function SEOHead({ title, description, ogImage, canonicalUrl, type = "website", publishedAt }: SEOHeadProps) {
  const site = useSiteSettings();
  const fullTitle = `${title} | ${site.site_title}`;
  const desc = description || site.site_description || "A modern blogging platform for sharing ideas and stories.";
  const image = ogImage || site.og_image_url;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {site.meta_keywords && <meta name="keywords" content={site.meta_keywords} />}
      {site.meta_author && <meta name="author" content={site.meta_author} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {type === "article" && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}
      {site.favicon_url && <link rel="icon" href={site.favicon_url} />}
      {site.google_analytics_id && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${site.google_analytics_id}`} />
          <script>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.google_analytics_id}');`}</script>
        </>
      )}
    </Helmet>
  );
}
