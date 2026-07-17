import HomePage from "@/components/HomePage";

export const metadata = {
  title: "Yozgat Yeminli Tercüman | Sworn & Notarized Translation",
  description: "Professional sworn and notarized translation services in Yozgat. Legal, academic, medical and official document translation with online support.",
  alternates: {
    canonical: "/en",
    languages: { "tr-TR": "/", "en": "/en", "ar": "/ar", "de": "/de", "fr": "/fr", "fa": "/fa" }
  },
  openGraph: {
    locale: "en_US",
    title: "Yozgat Yeminli Tercüman",
    description: "Reliable sworn and notarized translation services in Yozgat.",
    url: "/en"
  }
};

export default function EnglishPage() {
  return <HomePage locale="en"/>;
}
