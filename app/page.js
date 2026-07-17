import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ContactForm, QuoteForm } from "@/components/ContactForms";

const services = [
  ["🖋️","Noter Onaylı Tercüme","Diploma, pasaport, kimlik, doğum belgesi ve benzeri resmi belgelerin yeminli tercümesi ve noter tasdik süreci."],
  ["⚖️","Hukuki Çeviri","Mahkeme kararları, sözleşmeler, vekâletnameler ve diğer hukuki evrakların terminolojiye uygun çevirisi."],
  ["🎓","Akademik Tercüme","Tez, makale, transkript ve akademik yayınların uzmanlık alanına uygun çevirisi."],
  ["💼","Ticari ve Finansal Çeviri","Şirket belgeleri, mali tablolar, ticaret sicil kayıtları ve ticari yazışmalar."],
  ["🩺","Tıbbi Tercüme","Epikriz, doktor raporu, tıbbi makale ve medikal dokümanların dikkatli çevirisi."],
  ["🗣️","Sözlü Tercüme","Noter, nikâh dairesi, mahkeme ve iş görüşmelerinde sözlü tercümanlık desteği."]
];
const steps = [["1","Belgenizi hazırlayın","Belgenin net fotoğrafını çekin veya PDF olarak taratın."],["2","E-posta ile gönderin","Belgenizi resmi e-posta adresimize ekleyin."],["3","Teklifinizi onaylayın","Ücret, süre ve noter ihtiyacını birlikte netleştirelim."],["4","Teslim alın","Çevirinizi dijital olarak veya kargo ile teslim alın."]];

const jsonLd = {
  "@context":"https://schema.org","@type":["LocalBusiness","ProfessionalService"],
  name:"Yozgat Yeminli Tercüman", url:"https://yozgatyeminlitercuman.com",
  telephone:"+905325117544", email:"yozgattercumeofisi66@hotmail.com",
  image:"https://yozgatyeminlitercuman.com/images/camlik1.jpg",
  address:{"@type":"PostalAddress",streetAddress:"Medrese Mah. Şehit Mehmet Armağan Alper Sk. No:5 Mevlana İş Merkezi Kat:4 No:43",addressLocality:"Yozgat",addressCountry:"TR"},
  areaServed:["Yozgat","Türkiye"], priceRange:"₺₺",
  openingHoursSpecification:[
    {"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"08:30","closes":"18:00"},
    {"@type":"OpeningHoursSpecification","dayOfWeek":"Saturday","opens":"09:00","closes":"15:00"}
  ]
};

function Title({eyebrow,children}) { return <div className="section-title"><span>{eyebrow}</span><h2>{children}</h2></div>; }

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <Header/>
    <main>
      <section className="visual-hero">
        <Image src="/images/camlik1.jpg" alt="Yozgat Çamlık Milli Parkı" fill priority sizes="100vw"/>
        <div className="visual-overlay"/><div className="container visual-content"><span>YOZGAT&apos;TA PROFESYONEL ÇEVİRİ</span><h1>Resmi Belgeleriniz İçin Güvenilir Yeminli Tercüman</h1><p>Noter onaylı, hukuki, akademik ve teknik çeviri ihtiyaçlarınız için ofisten veya online destek alın.</p><div className="actions"><a className="btn gold" href="#online">Online fiyat teklifi</a><a className="btn outline" href="#contact">Ofis ve iletişim</a></div></div>
      </section>
      <section className="trust"><div className="container trust-grid"><div><strong>15+</strong><span>Desteklenen dil</span></div><div><strong>10K+</strong><span>Çevrilen belge</span></div><div><strong>Hızlı</strong><span>Teklif ve teslimat</span></div><div><strong>Gizli</strong><span>Belge güvenliği</span></div></div></section>

      <section id="about" className="section"><div className="container about-grid"><div><Title eyebrow="Biz kimiz?">Yozgat Yeminli Tercüman</Title><p>Yozgat Merkez&apos;deki ofisimizde bireysel ve kurumsal müşterilere, resmi süreçlere uygun profesyonel çeviri çözümleri sunuyoruz. Türkiye&apos;nin her yerinden belgeleri online kabul ediyor, süreç öncesinde ücret ve teslimat koşullarını açıkça paylaşıyoruz.</p><ul className="ticks"><li>Yeminli tercüman desteği</li><li>Noter tasdik süreci koordinasyonu</li><li>Belge gizliliğine özen</li><li>Dijital ve kargo teslim seçenekleri</li></ul></div><div className="image-card"><Image src="/images/saat-kulesi.jpg" alt="Yozgat Saat Kulesi" width={800} height={620} sizes="(max-width: 800px) 100vw, 50vw"/></div></div></section>

      <section id="services" className="section muted"><div className="container"><Title eyebrow="Hizmetlerimiz">Neler Çeviriyoruz?</Title><div className="cards">{services.map(([icon,title,text])=><article className="card" key={title}><span className="card-icon">{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section id="notary" className="section"><div className="container"><Title eyebrow="Noter tasdikli çeviri">Noter İşlemleri Hakkında</Title><div className="notary-grid"><article className="notary-main"><span className="pill">Yemin zaptı bulunan noterlik</span><h3>Yozgat 1. Noterliği</h3><p>Çeviri tamamlandıktan sonra gerekiyorsa noter tasdik süreci hakkında sizi bilgilendiriyoruz. Noter harçları ve işlemin kabul koşulları noterlik tarafından belirlenir.</p><address>Aşağınohutlu Mah., Emniyet Cad., Yozgat Belediyesi Hal ve İş Merkezi K:2 No:3/9-10, Merkez / Yozgat</address></article><div className="notary-list"><h3>Sık çevrilen belgeler</h3><ul className="ticks"><li>Diploma, transkript ve öğrenci belgeleri</li><li>Pasaport, kimlik ve nüfus kayıt örnekleri</li><li>Vekâletname ve muvafakatnameler</li><li>Sözleşmeler ve şirket evrakları</li><li>Mahkeme kararları ve resmi yazışmalar</li><li>Doğum, evlilik ve boşanma belgeleri</li></ul></div></div></div></section>

      <section id="online" className="section dark"><div className="container online-grid"><div><span className="eyebrow">OFİSE GELMENİZE GEREK YOK</span><h2>Belgenizi gönderin, teklifinizi alın</h2><p>Belgeyi göndermeden önce kişisel bilgileri gizleyebilir; noter gereksinimi, teslim süresi ve ücret hakkında ön bilgi isteyebilirsiniz.</p><div className="steps">{steps.map(([n,t,d])=><div className="step" key={n}><b>{n}</b><div><h3>{t}</h3><p>{d}</p></div></div>)}</div></div><QuoteForm/></div></section>

      <section id="contact" className="section"><div className="container"><Title eyebrow="Bize ulaşın">İletişim ve Konum</Title><div className="contact-grid"><div className="contact-details"><h3>İletişim Bilgileri</h3><p><b>Adres</b><br/>Medrese Mah. Şehit Mehmet Armağan Alper Sk. No:5 Mevlana İş Merkezi Kat:4 No:43, Merkez / Yozgat</p><p><b>Telefon</b><br/><a href="tel:+905325117544">0532 511 75 44</a></p><p><b>E-posta</b><br/><a href="mailto:yozgattercumeofisi66@hotmail.com">yozgattercumeofisi66@hotmail.com</a></p><p><b>Çalışma saatleri</b><br/>Pazartesi–Cuma: 08:30–18:00<br/>Cumartesi: 09:00–15:00<br/>Pazar: Kapalı</p></div><ContactForm/></div><div className="map"><iframe title="Yozgat Yeminli Tercüman ofis konumu" src="https://maps.google.com/maps?q=Yozgat%20Mevlana%20%C4%B0%C5%9F%20Merkezi&t=&z=16&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/></div></div></section>
    </main>
    <Footer/><a className="floating-wa" href="https://wa.me/905325117544?text=Merhaba%2C%20%C3%A7eviri%20hizmetiniz%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ile iletişim">◉</a>
  </>;
}
