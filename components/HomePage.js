"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "./Header";
import Footer from "./Footer";
import { ContactForm, QuoteForm } from "./ContactForms";

const copy = {
  tr: {
    visual: ["Yozgat Çamlık Milli Parkı", "Yozgat Merkez Saat Kulesi"],
    badge: "Google 5.0 Puanlı Tercüman", location: "Görsel",
    heroTitle: "Resmi Belgeleriniz İçin Güvenilir ve Hızlı Çeviri",
    heroText: "Noter onaylı, adli ve resmi tüm çevirileriniz yeminli tercümanlarımız tarafından Mevlana İş Merkezi’ndeki ofisimizde titizlikle hazırlanmaktadır. Ofisimize gelebilir veya belgelerinizi internet üzerinden göndererek işlemlerinizi hemen başlatabilirsiniz.",
    send: "İnternet Üzerinden Gönder", office: "Ofis Konumu",
    features: [
      ["Yeminli & Noter Onaylı", "Tüm resmi kurumlarda geçerli, noter tasdikli yeminli çeviri hizmeti."],
      ["Hızlı Teslimat", "Esnek ve hızlı çözümlerimizle belgelerinizi en kısa sürede teslim ediyoruz."],
      ["Çoklu Dil Desteği", "İngilizce, Almanca, Arapça, Fransızca, Rusça ve diğer dillerde çeviri."]
    ],
    aboutEyebrow: "Biz Kimiz?", aboutTitle: "Yozgat Yeminli Tercüman & Translator",
    aboutHead: "Yılların Verdiği Güven ve Deneyim",
    aboutText: "Yozgat Merkez’de yer alan fiziki ofisimizle bireysel ve kurumsal müşterilerimizin tüm çeviri ihtiyaçlarına yasal süreçlere uygun, profesyonel çözümler sunuyoruz. İnternet sitemiz ve iletişim kanallarımız aracılığıyla Türkiye’nin her yerine online destek sağlıyoruz.",
    points: ["Resmi yeminli tercüman desteği", "Noterlerle uyumlu çalışma", "Gizlilik ve güvenlik ilkeleri", "Online evrak kabulü ve kargo teslimi"],
    serviceEyebrow: "Hizmet Yelpazemiz", serviceTitle: "Neler Çeviriyoruz?",
    services: [
      ["Noter Onaylı Tercüme", "Diploma, pasaport, kimlik, doğum belgesi ve resmi belgelerin yeminli tercümesi ve noter tasdik işlemleri."],
      ["Hukuki Çeviri", "Mahkeme kararları, sözleşmeler, vekâletnameler ve yasal evrakların terminolojiye uygun çevirisi."],
      ["Akademik Tercüme", "Tez, makale, transkript ve akademik yayınların uzman tercümanlarca çevrilmesi."],
      ["Ticari & Finansal Çeviri", "Şirket belgeleri, mali tablolar, ticaret sicil kayıtları ve ticari yazışmalar."],
      ["Tıbbi Tercüme", "Doktor ve epikriz raporları, tıbbi makaleler ve medikal dokümanların çevirisi."],
      ["Sözlü Tercüme", "Noter, nikâh dairesi, mahkeme ve iş toplantılarında sözlü tercümanlık desteği."]
    ],
    notaryEyebrow: "Noter Tasdikli Çeviri Kılavuzu", notaryTitle: "Noter Onaylı Çeviri İşlemleri",
    notaryHead: "Yozgat 1. Noterliği Bilgileri",
    notaryText: "Yemin zaptımızın bulunduğu noterlik ofisimize yakın mesafededir. Çeviri tamamlandıktan sonra gerekiyorsa noter tasdik süreci hakkında sizi bilgilendiriyoruz.",
    common: "En Yaygın Noter Onaylı Belgeler",
    documents: ["Sözleşmeler ve taahhütler", "Vekâletname ve izinler", "Diploma ve transkript", "Pasaport ve kimlik belgeleri", "Tebligat ve resmi bildirimler", "Miras ve mahkeme evrakları"],
    onlineBadge: "Ofise Gelmenize Gerek Yok", onlineTitle: "İnternetten Gönderin, Çevirip Adresinize Ulaştıralım!",
    onlineText: "Belgenizi e-posta ile iletin; ücret, teslim süresi ve noter ihtiyacı netleştikten sonra çeviri sürecini başlatalım.",
    steps: [["Belgenizi hazırlayın", "Net bir fotoğraf çekin veya PDF olarak taratın."],["E-posta ile gönderin", "Belgenizi resmi e-posta adresimize iletin."],["Teklifinizi onaylayın", "Ücret ve teslim süresini birlikte netleştirelim."],["Teslim alın", "Dijital dosyayı veya onaylı aslı kargo ile alın."]],
    contactEyebrow: "Bize Ulaşın", contactTitle: "Ofisimiz ve İletişim Kanallarımız",
    contactHead: "İletişim Bilgileri", address: "Ofis Adresimiz", phone: "Telefon Numaramız", email: "E-Posta Adresimiz", hours: "Çalışma Saatleri", map: "Haritada Yerimiz"
  },
  en: {
    visual: ["Yozgat Çamlık National Park", "Yozgat Clock Tower"],
    badge: "Google 5.0 Rated Translator", location: "Image",
    heroTitle: "Reliable and Fast Translation for Your Official Documents",
    heroText: "Sworn, notarized, legal and official translations are carefully prepared by our translators at our office in Mevlana Business Center. Visit our office or send your documents online to start immediately.",
    send: "Send Documents Online", office: "Office Location",
    features: [
      ["Sworn & Notarized", "Sworn translations suitable for official and notarial procedures."],
      ["Fast Delivery", "Flexible solutions and carefully planned turnaround times for your documents."],
      ["Multiple Languages", "Translation in English, German, Arabic, French, Russian and many other languages."]
    ],
    aboutEyebrow: "Who We Are", aboutTitle: "Yozgat Sworn Translator",
    aboutHead: "Experience You Can Trust",
    aboutText: "From our physical office in central Yozgat, we provide professional translation solutions for individuals and businesses in line with official procedures. We also support clients throughout Türkiye through our online communication channels.",
    points: ["Professional sworn translator support", "Coordination with notaries", "Privacy and security principles", "Online document intake and courier delivery"],
    serviceEyebrow: "Our Services", serviceTitle: "What Do We Translate?",
    services: [
      ["Notarized Translation", "Sworn translation and notarial certification of diplomas, passports, identity and civil documents."],
      ["Legal Translation", "Accurate translation of court decisions, contracts, powers of attorney and legal records."],
      ["Academic Translation", "Translation of theses, articles, transcripts and academic publications."],
      ["Commercial & Financial", "Company records, financial statements, trade registry documents and correspondence."],
      ["Medical Translation", "Medical reports, discharge summaries, articles and healthcare documentation."],
      ["Interpreting", "Interpreting support at notaries, registry offices, courts and business meetings."]
    ],
    notaryEyebrow: "Notarized Translation Guide", notaryTitle: "Notarial Translation Procedures",
    notaryHead: "Yozgat 1st Notary Office",
    notaryText: "The notary holding our oath record is located close to our office. Once the translation is complete, we explain the certification process whenever it is required.",
    common: "Frequently Notarized Documents",
    documents: ["Contracts and commitments", "Powers of attorney and permissions", "Diplomas and transcripts", "Passports and identity documents", "Official notices", "Inheritance and court documents"],
    onlineBadge: "No Office Visit Required", onlineTitle: "Send Online and Receive Your Translation at Your Address",
    onlineText: "Send your document by email. Once the price, delivery time and notary requirements are confirmed, we begin the translation process.",
    steps: [["Prepare your document", "Take a clear photo or scan it as a PDF."],["Send by email", "Email the document to our official address."],["Approve your quote", "Confirm the price and delivery schedule."],["Receive it", "Get a digital copy or the certified original by courier."]],
    contactEyebrow: "Contact Us", contactTitle: "Our Office and Contact Channels",
    contactHead: "Contact Information", address: "Office Address", phone: "Telephone", email: "Email Address", hours: "Business Hours", map: "Our Location"
  },
  ar: {
    visual: ["منتزه يوزغات تشامليك الوطني", "برج الساعة في مركز يوزغات"],
    badge: "مترجم بتقييم 5.0 على Google", location: "الصورة",
    heroTitle: "ترجمة موثوقة وسريعة لوثائقكم الرسمية",
    heroText: "نُعدّ الترجمات المحلفة والموثقة والقانونية والرسمية بعناية في مكتبنا بمركز مولانا للأعمال. يمكنكم زيارة مكتبنا أو إرسال الوثائق عبر الإنترنت لبدء المعاملة مباشرة.",
    send: "إرسال الوثائق عبر الإنترنت", office: "موقع المكتب",
    features: [
      ["ترجمة محلفة وموثقة", "ترجمات محلفة مناسبة للمعاملات الرسمية وإجراءات الكاتب بالعدل."],
      ["تسليم سريع", "حلول مرنة ومواعيد تسليم واضحة ومدروسة لوثائقكم."],
      ["دعم لغات متعددة", "الترجمة بالتركية والإنجليزية والألمانية والعربية والفرنسية والروسية ولغات أخرى."]
    ],
    aboutEyebrow: "من نحن؟", aboutTitle: "مترجم يوزغات المحلف",
    aboutHead: "خبرة وثقة في خدمات الترجمة",
    aboutText: "نقدم من مكتبنا في مركز يوزغات حلول ترجمة احترافية للأفراد والمؤسسات وفق الإجراءات الرسمية. كما نخدم العملاء في جميع أنحاء تركيا عبر قنوات التواصل الإلكترونية.",
    points: ["دعم مترجمين محلفين", "تنسيق معاملات الكاتب بالعدل", "الالتزام بالخصوصية والأمان", "استلام الوثائق إلكترونياً والتسليم بالشحن"],
    serviceEyebrow: "خدماتنا", serviceTitle: "ما الوثائق التي نترجمها؟",
    services: [
      ["الترجمة الموثقة", "ترجمة وتصديق الشهادات وجوازات السفر والهويات ووثائق الأحوال المدنية."],
      ["الترجمة القانونية", "ترجمة قرارات المحاكم والعقود والوكالات والوثائق القانونية بمصطلحات دقيقة."],
      ["الترجمة الأكاديمية", "ترجمة الرسائل والأبحاث وكشوف الدرجات والمنشورات الأكاديمية."],
      ["الترجمة التجارية والمالية", "ترجمة وثائق الشركات والقوائم المالية والسجل التجاري والمراسلات."],
      ["الترجمة الطبية", "ترجمة التقارير الطبية وتقارير الخروج والأبحاث والوثائق الصحية."],
      ["الترجمة الشفوية", "دعم الترجمة الشفوية لدى الكاتب بالعدل والمحاكم ودوائر الزواج والاجتماعات."]
    ],
    notaryEyebrow: "دليل الترجمة الموثقة", notaryTitle: "إجراءات الترجمة لدى الكاتب بالعدل",
    notaryHead: "معلومات الكاتب بالعدل الأول في يوزغات",
    notaryText: "يقع مكتب الكاتب بالعدل الذي يحتوي على سجل يمين المترجم بالقرب من مكتبنا. بعد اكتمال الترجمة نشرح لكم خطوات التصديق عند الحاجة.",
    common: "الوثائق الأكثر طلباً للتصديق",
    documents: ["العقود والتعهدات", "الوكالات والموافقات", "الشهادات وكشوف الدرجات", "جوازات السفر والهويات", "الإشعارات الرسمية", "وثائق الميراث والمحاكم"],
    onlineBadge: "لا حاجة لزيارة المكتب", onlineTitle: "أرسلوا الوثيقة إلكترونياً واستلموا الترجمة في عنوانكم",
    onlineText: "أرسلوا الوثيقة عبر البريد الإلكتروني، وبعد توضيح السعر وموعد التسليم ومتطلبات التصديق نبدأ عملية الترجمة.",
    steps: [["جهّز الوثيقة", "التقط صورة واضحة أو امسحها بصيغة PDF."],["أرسلها بالبريد الإلكتروني", "أرسل الوثيقة إلى بريدنا الرسمي."],["وافق على العرض", "أكد السعر وموعد التسليم."],["استلم الترجمة", "استلم النسخة الرقمية أو الأصل المصدق عبر الشحن."]],
    contactEyebrow: "تواصلوا معنا", contactTitle: "مكتبنا وقنوات التواصل",
    contactHead: "معلومات التواصل", address: "عنوان المكتب", phone: "رقم الهاتف", email: "البريد الإلكتروني", hours: "ساعات العمل", map: "موقعنا على الخريطة"
  }
};

function SectionTitle({ eyebrow, title }) {
  return <div className="section-title"><span>{eyebrow}</span><h2>{title}</h2><i/></div>;
}

export default function HomePage({ locale = "tr" }) {
  const t = copy[locale];
  const ar = locale === "ar";
  const [slide, setSlide] = useState(0);
  useEffect(() => { const timer = setInterval(() => setSlide(v => (v + 1) % 2), 5000); return () => clearInterval(timer); }, []);
  const icons = ["🖋️", "⚖️", "🎓", "💼", "🩺", "🗣️"];

  return <div dir={ar ? "rtl" : "ltr"} className={ar ? "locale-ar" : undefined}>
    <Header locale={locale}/>
    <main>
      <section className="main-slider-section" aria-label={locale === "tr" ? "Yozgat görselleri" : "Images of Yozgat"}>
        <div className="hero-slider" style={{transform:`translateX(-${slide * 100}%)`}}>
          <div className="hero-slide"><Image src="/images/camlik1.jpg" alt={t.visual[0]} fill priority sizes="100vw"/></div>
          <div className="hero-slide"><Image src="/images/saat-kulesi.jpg" alt={t.visual[1]} fill priority sizes="100vw"/></div>
        </div>
        <button className="slider-btn prev-btn" onClick={() => setSlide((slide + 1) % 2)} aria-label="Previous">‹</button>
        <button className="slider-btn next-btn" onClick={() => setSlide((slide + 1) % 2)} aria-label="Next">›</button>
      </section>

      <section id="home" className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badges"><span>⭐ {t.badge}</span><span>📍 {t.location}: {t.visual[slide]}</span></div>
            <h1>{t.heroTitle}</h1><p>{t.heroText}</p>
            <div className="hero-buttons"><a className="btn btn-primary" href="#online-support">{t.send}</a><a className="btn btn-secondary" href="#contact">{t.office}</a></div>
          </div>
          <div className="hero-features">{t.features.map(([title,text],i)=><article className="feature-card" key={title}><b>{["📜","⚡","🌍"][i]}</b><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        </div>
      </section>

      <section id="about" className="about-section"><div className="container"><SectionTitle eyebrow={t.aboutEyebrow} title={t.aboutTitle}/><div className="about-grid"><div className="about-text"><h3>{t.aboutHead}</h3><p>{t.aboutText}</p><ul className="about-features">{t.points.map(x=><li key={x}>✅ {x}</li>)}</ul></div><div className="about-stats"><div><strong>15+</strong><span>{ar?"لغة مدعومة":locale==="tr"?"Desteklenen Dil":"Languages"}</span></div><div><strong>10K+</strong><span>{ar?"وثيقة مترجمة":locale==="tr"?"Çevrilen Belge":"Documents"}</span></div><div><strong>5.0 / 5</strong><span>Google</span></div><div><strong>Online</strong><span>{ar?"في جميع أنحاء تركيا":locale==="tr"?"Türkiye Geneli":"Across Türkiye"}</span></div></div></div></div></section>

      <section id="services" className="services-section"><div className="container"><SectionTitle eyebrow={t.serviceEyebrow} title={t.serviceTitle}/><div className="services-grid">{t.services.map(([title,text],i)=><article className="service-card" key={title}><span className="service-icon">{icons[i]}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section id="notary-info" className="notary-section"><div className="container"><SectionTitle eyebrow={t.notaryEyebrow} title={t.notaryTitle}/><div className="notary-grid"><article className="notary-address-card"><span className="notary-badge">✅ {ar?"سجل مترجم محلف":locale==="tr"?"Yetkili Yemin Zaptı":"Sworn Translator Record"}</span><h3>{t.notaryHead}</h3><p>{t.notaryText}</p><address>Aşağınohutlu Mahallesi, Emniyet Caddesi, Yozgat Belediyesi Hal ve İş Merkezi K:2 No:3/9-10, Merkez / Yozgat</address></article><article className="notary-list-card"><h3>{t.common}</h3><div className="notary-topics">{t.documents.map((x,i)=><div key={x}><b>{icons[i]} {x}</b><p>{ar?"تُحدد المتطلبات وفق غرض الوثيقة والجهة التي ستُقدم إليها.":locale==="tr"?"Belgenin kullanım amacı ve teslim edileceği kuruma göre süreç önceden netleştirilir.":"Requirements are confirmed according to the document’s purpose and receiving authority."}</p></div>)}</div></article></div></div></section>

      <section id="online-support" className="online-section"><div className="container online-wrapper"><div className="online-content"><span className="online-badge">{t.onlineBadge}</span><h2>{t.onlineTitle}</h2><p>{t.onlineText}</p><div className="steps-container">{t.steps.map(([title,text],i)=><div className="step-item" key={title}><b>{i+1}</b><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></div><QuoteForm locale={locale}/></div></section>

      <section id="contact" className="contact-section"><div className="container"><SectionTitle eyebrow={t.contactEyebrow} title={t.contactTitle}/><div className="contact-grid"><div className="contact-info"><h3>{t.contactHead}</h3><div className="info-item"><b>●</b><p><strong>{t.address}</strong><br/>Medrese Mah. Şehit Mehmet Armağan Alper Sk. No:5 Mevlana İş Merkezi Kat:4 No:43, Merkez / Yozgat</p></div><div className="info-item"><b>☎</b><p><strong>{t.phone}</strong><br/><a href="tel:+905325117544">0532 511 75 44</a></p></div><div className="info-item"><b>✉</b><p><strong>{t.email}</strong><br/><a href="mailto:yozgattercumeofisi66@hotmail.com">yozgattercumeofisi66@hotmail.com</a></p></div><div className="info-item"><b>◷</b><p><strong>{t.hours}</strong><br/>{locale==="tr"?"Pazartesi–Cuma: 08:30–18:00 · Cumartesi: 09:00–15:00":"Monday–Friday: 08:30–18:00 · Saturday: 09:00–15:00"}</p></div></div><ContactForm locale={locale}/></div><div className="map-container"><h3>{t.map}</h3><iframe title={t.map} src="https://maps.google.com/maps?q=Yozgat%20Mevlana%20%C4%B0%C5%9F%20Merkezi&t=&z=16&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/></div></div></section>
    </main>
    <Footer locale={locale}/>
    <a className="fixed-whatsapp" href="https://wa.me/905325117544" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">💬</a>
  </div>;
}
