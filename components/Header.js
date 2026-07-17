"use client";

import { useState } from "react";
import Link from "next/link";

const labels = {
  tr: {
    home: "Ana Sayfa", about: "Hakkımızda", services: "Hizmetlerimiz",
    notary: "Noter İşlemleri", online: "İnternet Desteği", contact: "İletişim & Konum",
    support: "Canlı Destek WhatsApp", menu: "Menüyü aç veya kapat", language: "English"
  },
  en: {
    home: "Home", about: "About Us", services: "Services",
    notary: "Notary Services", online: "Online Support", contact: "Contact & Location",
    support: "WhatsApp Live Support", menu: "Open or close menu"
  },
  ar: {
    home: "الرئيسية", about: "من نحن", services: "خدماتنا",
    notary: "خدمات الكاتب بالعدل", online: "الترجمة عن بُعد", contact: "التواصل والموقع",
    support: "دعم مباشر عبر واتساب", menu: "فتح أو إغلاق القائمة"
  },
  de: {
    home: "Startseite", about: "Über uns", services: "Leistungen",
    notary: "Notardienste", online: "Online-Service", contact: "Kontakt & Standort",
    support: "WhatsApp-Support", menu: "Menü öffnen oder schließen"
  },
  fr: {
    home: "Accueil", about: "À propos", services: "Services",
    notary: "Services notariaux", online: "Service en ligne", contact: "Contact & adresse",
    support: "Assistance WhatsApp", menu: "Ouvrir ou fermer le menu"
  },
  fa: {
    home: "صفحه اصلی", about: "درباره ما", services: "خدمات",
    notary: "خدمات دفتر اسناد رسمی", online: "خدمات آنلاین", contact: "تماس و نشانی",
    support: "پشتیبانی واتساپ", menu: "باز یا بسته کردن منو"
  }
};

export default function Header({ locale = "tr" }) {
  const [open, setOpen] = useState(false);
  const t = labels[locale];
  const base = locale === "tr" ? "/" : `/${locale}`;
  const links = [
    [t.about, "about"], [t.services, "services"], [t.notary, "notary-info"],
    [t.online, "online-support"], [t.contact, "contact"]
  ];

  return <>
    <div className="top-bar">
      <div className="container top-bar-inner">
        <div className="top-bar-info">
          <a href="tel:+905325117544">☎ 0532 511 75 44</a>
          <a href="mailto:yozgattercumeofisi66@hotmail.com">✉ yozgattercumeofisi66@hotmail.com</a>
          <span>● Mevlana İş Merkezi Kat: 4, Merkez / Yozgat</span>
        </div>
        <a className="whatsapp-top" href="https://wa.me/905325117544" target="_blank" rel="noopener noreferrer">{t.support}</a>
      </div>
    </div>
    <header className="main-header">
      <div className="container header-container">
        <Link className="logo" href="/" title="Yozgat Yeminli Tercüman ana sayfa">
          <span className="logo-icon">⚖</span>
          <span className="logo-text"><strong>YOZGAT YEMİNLİ</strong><small>TERCÜMAN · TRANSLATOR · مترجم</small></span>
        </Link>
        <button className="hamburger-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="main-menu" aria-label={t.menu}><span/><span/><span/></button>
        <nav id="main-menu" className={`nav-menu${open ? " active" : ""}`} aria-label="Main navigation">
          <Link href={base} onClick={() => setOpen(false)}>{t.home}</Link>
          {links.map(([label, id]) => <Link key={id} href={`${base}#${id}`} onClick={() => setOpen(false)}>{label}</Link>)}
          <span className="language-switcher" aria-label="Language">
            <Link className={locale === "tr" ? "selected" : ""} href="/" hrefLang="tr">TR</Link>
            <Link className={locale === "en" ? "selected" : ""} href="/en" hrefLang="en">EN</Link>
            <Link className={locale === "ar" ? "selected" : ""} href="/ar" hrefLang="ar">AR</Link>
            <Link className={locale === "de" ? "selected" : ""} href="/de" hrefLang="de">DE</Link>
            <Link className={locale === "fr" ? "selected" : ""} href="/fr" hrefLang="fr">FR</Link>
            <Link className={locale === "fa" ? "selected" : ""} href="/fa" hrefLang="fa">FA</Link>
          </span>
        </nav>
      </div>
    </header>
  </>;
}
