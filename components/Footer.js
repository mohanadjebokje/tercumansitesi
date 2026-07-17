import Link from "next/link";

export default function Footer({ locale = "tr" }) {
  const en = locale === "en";
  const base = en ? "/en" : "/";
  return <footer className="main-footer">
    <div className="container footer-grid">
      <div className="footer-about"><h2>YOZGAT YEMİNLİ TERCÜMAN</h2><p>{en ? "Professional sworn, legal, academic and official translation services in Yozgat." : "Resmi, hukuki, akademik ve teknik belgeler için profesyonel yeminli tercüme hizmetleri."}</p></div>
      <div><h3>{en ? "Quick Links" : "Hızlı Erişim"}</h3><a href={`${base}#about`}>{en?"About Us":"Hakkımızda"}</a><a href={`${base}#services`}>{en?"Services":"Hizmetler"}</a><a href={`${base}#online-support`}>{en?"Online Quote":"Online Teklif"}</a><a href={`${base}#contact`}>{en?"Contact":"İletişim"}</a></div>
      <div><h3>{en ? "Legal" : "Yasal"}</h3><Link href="/kvkk-aydinlatma-metni">KVKK</Link><Link href="/gizlilik-politikasi">{en?"Privacy Policy":"Gizlilik Politikası"}</Link><Link href="/cerez-politikasi">{en?"Cookie Policy":"Çerez Politikası"}</Link><Link href="/kullanim-kosullari">{en?"Terms of Use":"Kullanım Koşulları"}</Link></div>
      <div><h3>{en ? "Contact" : "İletişim"}</h3><a href="tel:+905325117544">0532 511 75 44</a><a href="mailto:yozgattercumeofisi66@hotmail.com">yozgattercumeofisi66@hotmail.com</a><p>Mevlana İş Merkezi Kat: 4 No: 43, Merkez / Yozgat</p></div>
    </div>
    <div className="footer-bottom">© {new Date().getFullYear()} Yozgat Yeminli Tercüman. {en ? "All rights reserved." : "Tüm hakları saklıdır."}</div>
  </footer>;
}
