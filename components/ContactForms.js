"use client";
import { useState } from "react";

const clean = (value, length) => String(value || "").replace(/[<>]/g, "").trim().slice(0, length);

export function QuoteForm({ locale = "tr" }) {
  const en = locale === "en";
  const ar = locale === "ar";
  const word = (tr, english, arabic) => ar ? arabic : en ? english : tr;
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`${word("Çeviri fiyat talebi","Translation quote","طلب عرض سعر للترجمة")}: ${clean(form.get("document"), 80)}`);
    const body = encodeURIComponent(`${word("Kaynak dil","Source language","لغة الوثيقة")}: ${form.get("source")}\n${word("Hedef dil","Target language","اللغة المطلوبة")}: ${form.get("target")}\n${word("Belge","Document","الوثيقة")}: ${clean(form.get("document"),80)}`);
    window.location.href = `mailto:yozgattercumeofisi66@hotmail.com?subject=${subject}&body=${body}`;
  }
  return <form className="online-cta-box" onSubmit={submit}>
    <h3>{word("Hemen Fiyat Teklifi Alın","Get a Quote Now","احصل على عرض سعر الآن")}</h3>
    <p>{word("Belge ve hedef çeviri dilini seçin.","Select the document and target languages.","اختر لغة الوثيقة واللغة المطلوبة.")}</p>
    <label>{word("Belge dili","Document language","لغة الوثيقة")}<select name="source" required defaultValue=""><option value="" disabled>{word("Seçiniz","Select","اختر")}</option><option>Türkçe</option><option>English</option><option>Deutsch</option><option>العربية</option><option>Français</option><option>Русский</option></select></label>
    <label>{word("Hedef dil","Target language","اللغة المطلوبة")}<select name="target" required defaultValue=""><option value="" disabled>{word("Seçiniz","Select","اختر")}</option><option>Türkçe</option><option>English</option><option>Deutsch</option><option>العربية</option><option>Français</option><option>Русский</option></select></label>
    <label>{word("Belge türü","Document type","نوع الوثيقة")}<input name="document" required maxLength="80" placeholder={word("Diploma, pasaport, sözleşme...","Diploma, passport, contract...","شهادة، جواز سفر، عقد...")}/></label>
    <label className="privacy-check"><input type="checkbox" required/><span>{word("KVKK Aydınlatma Metni’ni okudum; bilgilerimin teklif amacıyla işlenmesini kabul ediyorum.","I have read the privacy notice and consent to processing for a quote.","قرأت إشعار الخصوصية وأوافق على معالجة معلوماتي لغرض إعداد العرض.")}</span></label>
    <button className="btn btn-primary" type="submit">{word("E-posta ile fiyat sor","Request quote by email","اطلب عرضاً عبر البريد")}</button>
  </form>;
}

export function ContactForm({ locale = "tr" }) {
  const en = locale === "en";
  const ar = locale === "ar";
  const word = (tr, english, arabic) => ar ? arabic : en ? english : tr;
  const [status,setStatus] = useState("");
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = encodeURIComponent(`${en?"Name":"Ad Soyad"}: ${clean(form.get("name"),80)}\n${en?"Phone":"Telefon"}: ${clean(form.get("phone"),20)}\nE-mail: ${clean(form.get("email"),120)}\n\n${clean(form.get("message"),1200)}`);
    window.location.href = `mailto:yozgattercumeofisi66@hotmail.com?subject=${encodeURIComponent(clean(form.get("subject"),120))}&body=${body}`;
    setStatus(word("E-posta uygulamanız açıldı.","Your email application has opened.","تم فتح تطبيق البريد الإلكتروني."));
  }
  return <form className="contact-form-wrapper" onSubmit={submit}><h3>{word("Bize Mesaj Gönderin","Send Us a Message","أرسل لنا رسالة")}</h3>
    <div className="form-row"><label>{word("Ad soyad","Full name","الاسم الكامل")}<input name="name" required/></label><label>{word("Telefon","Telephone","الهاتف")}<input name="phone" type="tel" required/></label></div>
    <label>E-mail<input name="email" type="email" required/></label><label>{word("Konu","Subject","الموضوع")}<input name="subject" required/></label>
    <label>{word("Mesaj","Message","الرسالة")}<textarea name="message" rows="5" required/></label>
    <label className="privacy-check"><input type="checkbox" required/><span>{word("KVKK Aydınlatma Metni’ni okudum.","I have read the privacy notice.","قرأت إشعار الخصوصية.")}</span></label>
    <button className="btn btn-primary" type="submit">{word("Mesajı gönder","Send message","إرسال الرسالة")}</button><p role="status">{status}</p>
  </form>;
}
