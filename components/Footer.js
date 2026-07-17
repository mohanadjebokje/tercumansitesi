import Link from "next/link";
export default function Footer() {
  return <footer><div className="container footer-grid">
    <div><h2>Yozgat Yeminli Tercüman</h2><p>Resmi, hukuki, akademik ve teknik belgeler için profesyonel tercüme hizmetleri.</p></div>
    <div><h3>Hızlı Erişim</h3><a href="/#services">Hizmetlerimiz</a><a href="/#online">Online Teklif</a><a href="/#contact">İletişim</a></div>
    <div><h3>Yasal</h3><Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link><Link href="/gizlilik-politikasi">Gizlilik Politikası</Link><Link href="/cerez-politikasi">Çerez Politikası</Link><Link href="/kullanim-kosullari">Kullanım Koşulları</Link></div>
    <div><h3>İletişim</h3><a href="tel:+905325117544">0532 511 75 44</a><a href="mailto:yozgattercumeofisi66@hotmail.com">yozgattercumeofisi66@hotmail.com</a><p>Mevlana İş Merkezi Kat: 4 No: 43, Merkez / Yozgat</p></div>
  </div><div className="copyright">© {new Date().getFullYear()} Yozgat Yeminli Tercüman. Tüm hakları saklıdır.</div></footer>;
}
