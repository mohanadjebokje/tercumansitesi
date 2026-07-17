import "./globals.css";

const siteUrl = "https://yozgatyeminlitercuman.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Yozgat Yeminli Tercüman | Noter Onaylı Çeviri", template: "%s | Yozgat Yeminli Tercüman" },
  description: "Yozgat'ta yeminli tercüman, noter onaylı tercüme ve online belge çevirisi. Resmi, hukuki, akademik ve teknik çeviri hizmetleri.",
  keywords: ["Yozgat yeminli tercüman", "Yozgat tercüme bürosu", "noter onaylı tercüme", "online tercüme Yozgat"],
  alternates: {
    canonical: "/",
    languages: { "tr-TR": "/", "en": "/en", "ar": "/ar", "de": "/de", "fr": "/fr", "fa": "/fa" }
  },
  openGraph: {
    type: "website", locale: "tr_TR", url: siteUrl,
    siteName: "Yozgat Yeminli Tercüman",
    title: "Yozgat Yeminli Tercüman | Noter Onaylı Çeviri",
    description: "Resmi belgeleriniz için hızlı, güvenilir ve noter onaylı tercüme hizmeti.",
    images: [{ url: "/images/camlik1.jpg", width: 1200, height: 630, alt: "Yozgat Yeminli Tercüman" }]
  },
  twitter: { card: "summary_large_image", title: "Yozgat Yeminli Tercüman", images: ["/images/camlik1.jpg"] },
  robots: { index: true, follow: true },
  category: "business"
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0b1e3f" };

export default function RootLayout({ children }) {
  return <html lang="tr"><body>{children}</body></html>;
}
