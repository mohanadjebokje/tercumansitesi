import HomePage from "@/components/HomePage";

export const metadata = {
  title: "Yozgat Yeminli Tercüman | ترجمة محلفة وموثقة",
  description: "خدمات ترجمة محلفة وموثقة احترافية في يوزغات للوثائق القانونية والأكاديمية والطبية والرسمية مع دعم إلكتروني.",
  alternates: {
    canonical: "/ar",
    languages: { "tr-TR": "/", "en": "/en", "ar": "/ar", "de": "/de", "fr": "/fr", "fa": "/fa" }
  },
  openGraph: {
    locale: "ar_AR",
    title: "Yozgat Yeminli Tercüman",
    description: "خدمات ترجمة محلفة وموثقة موثوقة في يوزغات.",
    url: "/ar"
  }
};

export default function ArabicPage() {
  return <HomePage locale="ar"/>;
}
