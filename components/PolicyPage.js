import Header from "./Header";
import Footer from "./Footer";
export default function PolicyPage({title, updated="17 Temmuz 2026", children}) {
  return <><Header/><main className="policy"><div className="container narrow"><span className="eyebrow">YASAL BİLGİLENDİRME</span><h1>{title}</h1><p className="updated">Son güncelleme: {updated}</p>{children}<aside>Bu metin genel bilgilendirme amacıyla hazırlanmıştır. İşletmenin gerçek veri işleme süreçleri değişirse metin de güncellenmelidir.</aside></div></main><Footer/></>;
}
