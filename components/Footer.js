import Link from "next/link";

export default function Footer({ locale = "tr" }) {
  const en = locale === "en";
  const ar = locale === "ar";
  const base = en ? "/en" : ar ? "/ar" : "/";
  const word = (tr, english, arabic) => ar ? arabic : en ? english : tr;
  return <footer className="main-footer">
    <div className="container footer-grid">
      <div className="footer-about"><h2>YOZGAT YEMİNLİ TERCÜMAN</h2><p>{word("Resmi, hukuki, akademik ve teknik belgeler için profesyonel yeminli tercüme hizmetleri.","Professional sworn, legal, academic and official translation services in Yozgat.","خدمات ترجمة محلفة وقانونية وأكاديمية ورسمية احترافية في يوزغات.")}</p></div>
      <div><h3>{word("Hızlı Erişim","Quick Links","روابط سريعة")}</h3><a href={`${base}#about`}>{word("Hakkımızda","About Us","من نحن")}</a><a href={`${base}#services`}>{word("Hizmetler","Services","الخدمات")}</a><a href={`${base}#online-support`}>{word("Online Teklif","Online Quote","طلب عرض سعر")}</a><a href={`${base}#contact`}>{word("İletişim","Contact","التواصل")}</a></div>
      <div><h3>{word("Yasal","Legal","قانوني")}</h3><Link href="/kvkk-aydinlatma-metni">KVKK</Link><Link href="/gizlilik-politikasi">{word("Gizlilik Politikası","Privacy Policy","سياسة الخصوصية")}</Link><Link href="/cerez-politikasi">{word("Çerez Politikası","Cookie Policy","سياسة ملفات الارتباط")}</Link><Link href="/kullanim-kosullari">{word("Kullanım Koşulları","Terms of Use","شروط الاستخدام")}</Link></div>
      <div><h3>{word("İletişim","Contact","التواصل")}</h3><a href="tel:+905325117544">0532 511 75 44</a><a href="mailto:yozgattercumeofisi66@hotmail.com">yozgattercumeofisi66@hotmail.com</a><p>Mevlana İş Merkezi Kat: 4 No: 43, Merkez / Yozgat</p></div>
    </div>
    <div className="footer-bottom">© {new Date().getFullYear()} Yozgat Yeminli Tercüman. {word("Tüm hakları saklıdır.","All rights reserved.","جميع الحقوق محفوظة.")}</div>
  </footer>;
}
