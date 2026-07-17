"use client";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);
  const links = [["Hakkımızda","about"],["Hizmetler","services"],["Noter İşlemleri","notary"],["Online Destek","online"],["İletişim","contact"]];
  return <>
    <div className="topbar"><div className="container topbar-inner">
      <div><a href="tel:+905325117544">☎ 0532 511 75 44</a><a href="mailto:yozgattercumeofisi66@hotmail.com">✉ yozgattercumeofisi66@hotmail.com</a></div>
      <a className="wa-small" href="https://wa.me/905325117544" target="_blank" rel="noopener noreferrer">WhatsApp</a>
    </div></div>
    <header className="header"><div className="container nav">
      <Link className="brand" href="/"><span className="brand-icon">⚖</span><span><strong>YOZGAT YEMİNLİ</strong><small>TERCÜMAN · TRANSLATOR · مترجم</small></span></Link>
      <button className="menu-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="main-menu" aria-label="Menüyü aç veya kapat"><span/><span/><span/></button>
      <nav id="main-menu" className={open ? "nav-links open" : "nav-links"} aria-label="Ana menü">
        <Link href="/" onClick={() => setOpen(false)}>Ana Sayfa</Link>
        {links.map(([label,id]) => <Link key={id} href={`/#${id}`} onClick={() => setOpen(false)}>{label}</Link>)}
      </nav>
    </div></header>
  </>;
}
