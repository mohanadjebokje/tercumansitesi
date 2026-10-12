import Link from "next/link";

export default function Footer({ locale = "tr" }) {
  const en = locale === "en";
  const ar = locale === "ar";
  const base = locale === "tr" ? "/" : `/${locale}`;
  const translations = {
    de:["Professionelle beglaubigte, juristische, akademische und offizielle Übersetzungen in Yozgat.","Schnellzugriff","Über uns","Leistungen","Online-Angebot","Kontakt","Rechtliches","Datenschutz","Cookie-Richtlinie","Nutzungsbedingungen","Alle Rechte vorbehalten."],
    fr:["Traductions assermentées, juridiques, académiques et officielles à Yozgat.","Accès rapide","À propos","Services","Devis en ligne","Contact","Mentions légales","Confidentialité","Politique des cookies","Conditions d’utilisation","Tous droits réservés."],
    fa:["خدمات حرفه‌ای ترجمه رسمی، حقوقی، دانشگاهی و اداری در یوزگات.","دسترسی سریع","درباره ما","خدمات","درخواست قیمت آنلاین","تماس","قوانین","حریم خصوصی","سیاست کوکی","شرایط استفاده","تمامی حقوق محفوظ است."]
  };
  const extra = translations[locale];
  const word = (tr, english, arabic, index) => extra ? extra[index] : ar ? arabic : en ? english : tr;
  return <footer className="main-footer">
    <div className="container footer-grid">
      <div className="footer-about"><h2>YOZGAT YEMİNLİ TERCÜMAN</h2><p>{word("Resmi, hukuki, akademik ve teknik belgeler için profesyonel yeminli tercüme hizmetleri.","Professional sworn, legal, academic and official translation services in Yozgat.","خدمات ترجمة محلفة وقانونية وأكاديمية ورسمية احترافية في يوزغات.",0)}</p></div>
      <div><h3>{word("Hızlı Erişim","Quick Links","روابط سريعة",1)}</h3><a href={`${base}#about`}>{word("Hakkımızda","About Us","من نحن",2)}</a><a href={`${base}#services`}>{word("Hizmetler","Services","الخدمات",3)}</a><a href={`${base}#online-support`}>{word("Online Teklif","Online Quote","طلب عرض سعر",4)}</a><a href={`${base}#contact`}>{word("İletişim","Contact","التواصل",5)}</a></div>
      <div><h3>{word("Yasal","Legal","قانوني",6)}</h3><Link href="/kvkk-aydinlatma-metni">KVKK</Link><Link href="/gizlilik-politikasi">{word("Gizlilik Politikası","Privacy Policy","سياسة الخصوصية",7)}</Link><Link href="/cerez-politikasi">{word("Çerez Politikası","Cookie Policy","سياسة ملفات الارتباط",8)}</Link><Link href="/kullanim-kosullari">{word("Kullanım Koşulları","Terms of Use","شروط الاستخدام",9)}</Link></div>
      <div><h3>{word("İletişim","Contact","التواصل",5)}</h3><a href="tel:+905325117544">0532 511 75 44</a><a href="mailto:yozgattercumeofisi66@hotmail.com">yozgattercumeofisi66@hotmail.com</a><p>Mevlana İş Merkezi Kat: 4 No: 43, Merkez / Yozgat</p></div>
    </div>
    <div className="footer-bottom">© {new Date().getFullYear()} Yozgat Yeminli Tercüman. {word("Tüm hakları saklıdır.","All rights reserved.","جميع الحقوق محفوظة.",10)}</div>
  </footer>;
}
