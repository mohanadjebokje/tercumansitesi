"use client";
import { useState } from "react";

const clean = (v, n) => String(v || "").replace(/[<>]/g, "").trim().slice(0,n);

export function QuoteForm() {
  const submit = e => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const subject = encodeURIComponent(`Fiyat Talebi: ${clean(f.get("doc"),80)}`);
    const body = encodeURIComponent(`Kaynak dil: ${f.get("source")}\nHedef dil: ${f.get("target")}\nBelge türü: ${clean(f.get("doc"),80)}`);
    window.location.href = `mailto:yozgattercumeofisi66@hotmail.com?subject=${subject}&body=${body}`;
  };
  return <form className="form-card" onSubmit={submit}><h3>Hemen Fiyat Teklifi Alın</h3>
    <label>Belge dili<select name="source" required defaultValue=""><option value="" disabled>Seçiniz</option><option>Türkçe</option><option>İngilizce</option><option>Almanca</option><option>Arapça</option><option>Fransızca</option><option>Rusça</option><option>Diğer</option></select></label>
    <label>Hedef dil<select name="target" required defaultValue=""><option value="" disabled>Seçiniz</option><option>Türkçe</option><option>İngilizce</option><option>Almanca</option><option>Arapça</option><option>Fransızca</option><option>Rusça</option><option>Diğer</option></select></label>
    <label>Belge türü<input name="doc" required maxLength="80" placeholder="Diploma, pasaport, sözleşme..." /></label>
    <label className="check"><input type="checkbox" required/> <span><a href="/kvkk-aydinlatma-metni" target="_blank">KVKK Aydınlatma Metni</a>&apos;ni okudum; bilgilerimin teklif amacıyla işlenmesini kabul ediyorum.</span></label>
    <button className="btn gold" type="submit">E-posta ile fiyat sor</button>
  </form>;
}

export function ContactForm() {
  const [status,setStatus] = useState("");
  const submit = e => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const body = encodeURIComponent(`Ad Soyad: ${clean(f.get("name"),80)}\nTelefon: ${clean(f.get("phone"),20)}\nE-posta: ${clean(f.get("email"),120)}\n\n${clean(f.get("message"),1200)}`);
    window.location.href = `mailto:yozgattercumeofisi66@hotmail.com?subject=${encodeURIComponent(clean(f.get("subject"),120))}&body=${body}`;
    setStatus("E-posta uygulamanız açıldı. Gönderimi uygulamanızdan tamamlayabilirsiniz.");
  };
  return <form className="form-card contact-form" onSubmit={submit}><h3>Bize Mesaj Gönderin</h3>
    <div className="form-row"><label>Ad soyad<input name="name" autoComplete="name" required maxLength="80"/></label><label>Telefon<input name="phone" type="tel" autoComplete="tel" required maxLength="20"/></label></div>
    <label>E-posta<input name="email" type="email" autoComplete="email" required maxLength="120"/></label>
    <label>Konu<input name="subject" required maxLength="120"/></label><label>Mesaj<textarea name="message" rows="5" required maxLength="1200"/></label>
    <label className="check"><input type="checkbox" required/><span><a href="/kvkk-aydinlatma-metni" target="_blank">KVKK Aydınlatma Metni</a>&apos;ni okudum.</span></label>
    <button className="btn gold" type="submit">Mesajı gönder</button><p role="status">{status}</p>
  </form>;
}
