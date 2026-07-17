import HomePage from "@/components/HomePage";

export const metadata = {
  title: "مترجم محلف في يوزغات | ترجمة موثقة",
  description: "خدمات ترجمة محلفة وموثقة احترافية في يوزغات للوثائق القانونية والأكاديمية والطبية والرسمية مع دعم إلكتروني.",
  alternates: {
    canonical: "/ar",
    languages: { "tr-TR": "/", "en": "/en", "ar": "/ar" }
  },
  openGraph: {
    locale: "ar_AR",
    title: "مترجم محلف في يوزغات",
    description: "خدمات ترجمة محلفة وموثقة موثوقة في يوزغات.",
    url: "/ar"
  }
};

export default function ArabicPage() {
  return <HomePage locale="ar"/>;
}
