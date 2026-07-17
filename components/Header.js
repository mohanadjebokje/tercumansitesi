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
    support: "WhatsApp Live Support", menu: "Open or close menu", language: "Türkçe"
  }
};

export default function Header({ locale = "tr" }) {
  const [open, setOpen] = useState(false);
  const t = labels[locale];
  const base = locale === "en" ? "/en" : "/";
  const otherLocale = locale === "en" ? "/" : "/en";
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
        <Link className="logo" href={base}>
          <span className="logo-icon">⚖</span>
          <span className="logo-text"><strong>YOZGAT YEMİNLİ</strong><small>TERCÜMAN · TRANSLATOR · مترجم</small></span>
        </Link>
        <button className="hamburger-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="main-menu" aria-label={t.menu}><span/><span/><span/></button>
        <nav id="main-menu" className={`nav-menu${open ? " active" : ""}`} aria-label="Main navigation">
          <Link href={base} onClick={() => setOpen(false)}>{t.home}</Link>
          {links.map(([label, id]) => <Link key={id} href={`${base}#${id}`} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link className="language-toggle" href={otherLocale} hrefLang={locale === "en" ? "tr" : "en"}>🌐 {t.language}</Link>
        </nav>
      </div>
    </header>
  </>;
}
