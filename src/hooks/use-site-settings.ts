import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  site_title: string;
  site_description: string;
  site_tagline: string;
  favicon_url: string;
  site_icon_url: string;
  og_image_url: string;
  meta_keywords: string;
  meta_author: string;
  google_analytics_id: string;
  social_twitter: string;
  social_facebook: string;
  social_instagram: string;
  social_linkedin: string;
}

const defaults: SiteSettings = {
  site_title: "Inkwell",
  site_description: "A modern blog platform",
  site_tagline: "",
  favicon_url: "",
  site_icon_url: "",
  og_image_url: "",
  meta_keywords: "",
  meta_author: "",
  google_analytics_id: "",
  social_twitter: "",
  social_facebook: "",
  social_instagram: "",
  social_linkedin: "",
};

let cached: SiteSettings | null = null;
let fetchPromise: Promise<SiteSettings> | null = null;

async function fetchSettings(): Promise<SiteSettings> {
  const { data } = await supabase.from("site_settings").select("*").limit(1).single();
  const result = data ? { ...defaults, ...data } as SiteSettings : defaults;
  cached = result;
  return result;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cached || defaults);

  useEffect(() => {
    if (cached) { setSettings(cached); return; }
    if (!fetchPromise) fetchPromise = fetchSettings();
    fetchPromise.then(setSettings);
  }, []);

  return settings;
}
