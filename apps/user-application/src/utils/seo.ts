export interface SeoOptions {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  robots?: string;
}

export const seo = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  robots = "index, follow",
}: SeoOptions) => {
  const tags: Array<{ [key: string]: string | undefined }> = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: robots },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: "@saas_starter" },
    { name: "twitter:site", content: "@saas_starter" },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];

  if (keywords) {
    tags.push({ name: "keywords", content: keywords });
  }

  if (url) {
    tags.push({ property: "og:url", content: url });
  }

  if (image) {
    tags.push(
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: image },
      { property: "og:image", content: image }
    );
  }

  return tags;
};

/**
 * Generates JSON-LD Structured Data script tag object for WebSite / SaaS application.
 */
export function createJsonLdSoftwareApp(options: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
  price?: string;
  currency?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: options.name,
    description: options.description,
    url: options.url,
    applicationCategory: options.applicationCategory ?? "BusinessApplication",
    operatingSystem: options.operatingSystem ?? "Web",
    offers: {
      "@type": "Offer",
      price: options.price ?? "0",
      priceCurrency: options.currency ?? "USD",
    },
  };
}
