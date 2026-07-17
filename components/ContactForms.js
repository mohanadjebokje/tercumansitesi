"use client";
import { useState } from "react";

const clean = (value, length) => String(value || "").replace(/[<>]/g, "").trim().slice(0, length);

export function QuoteForm({ locale = "tr" }) {
  const en = locale === "en";
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`${en ? "Translation quote" : "Çeviri fiyat talebi"}: ${clean(form.get("document"), 80)}`);
    const body = encodeURIComponent(`${en?"Source language":"Kaynak dil"}: ${form.get("source")}\n${en?"Target language":"Hedef dil"}: ${form.get("target")}\n${en?"Document":"Belge"}: ${clean(form.get("document"),80)}`);
    window.location.href = `mailto:yozgattercumeofisi66@hotmail.com?subject=${subject}&body=${body}`;
  }
  return <form className="online-cta-box" onSubmit={submit}>
    <h3>{en ? "Get a Quote Now" : "Hemen Fiyat Teklifi Alın"}</h3>
    <p>{en ? "Select the document and target languages." : "Belge ve hedef çeviri dilini seçin."}</p>
    <label>{en?"Document language":"Belge dili"}<select name="source" required defaultValue=""><option value="" disabled>{en?"Select":"Seçiniz"}</option><option>Türkçe</option><option>English</option><option>Deutsch</option><option>العربية</option><option>Français</option><option>Русский</option></select></label>
    <label>{en?"Target language":"Hedef dil"}<select name="target" required defaultValue=""><option value="" disabled>{en?"Select":"Seçiniz"}</option><option>Türkçe</option><option>English</option><option>Deutsch</option><option>العربية</option><option>Français</option><option>Русский</option></select></label>
    <label>{en?"Document type":"Belge türü"}<input name="document" required maxLength="80" placeholder={en?"Diploma, passport, contract...":"Diploma, pasaport, sözleşme..."}/></label>
    <label className="privacy-check"><input type="checkbox" required/><span>{en?"I have read the privacy notice and consent to processing for a quote.":"KVKK Aydınlatma Metni’ni okudum; bilgilerimin teklif amacıyla işlenmesini kabul ediyorum."}</span></label>
    <button className="btn btn-primary" type="submit">{en?"Request quote by email":"E-posta ile fiyat sor"}</button>
  </form>;
}

export function ContactForm({ locale = "tr" }) {
  const en = locale === "en";
  const [status,setStatus] = useState("");
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = encodeURIComponent(`${en?"Name":"Ad Soyad"}: ${clean(form.get("name"),80)}\n${en?"Phone":"Telefon"}: ${clean(form.get("phone"),20)}\nE-mail: ${clean(form.get("email"),120)}\n\n${clean(form.get("message"),1200)}`);
    window.location.href = `mailto:yozgattercumeofisi66@hotmail.com?subject=${encodeURIComponent(clean(form.get("subject"),120))}&body=${body}`;
    setStatus(en ? "Your email application has opened." : "E-posta uygulamanız açıldı.");
  }
  return <form className="contact-form-wrapper" onSubmit={submit}><h3>{en?"Send Us a Message":"Bize Mesaj Gönderin"}</h3>
    <div className="form-row"><label>{en?"Full name":"Ad soyad"}<input name="name" required/></label><label>{en?"Telephone":"Telefon"}<input name="phone" type="tel" required/></label></div>
    <label>E-mail<input name="email" type="email" required/></label><label>{en?"Subject":"Konu"}<input name="subject" required/></label>
    <label>{en?"Message":"Mesaj"}<textarea name="message" rows="5" required/></label>
    <label className="privacy-check"><input type="checkbox" required/><span>{en?"I have read the privacy notice.":"KVKK Aydınlatma Metni’ni okudum."}</span></label>
    <button className="btn btn-primary" type="submit">{en?"Send message":"Mesajı gönder"}</button><p role="status">{status}</p>
  </form>;
}
