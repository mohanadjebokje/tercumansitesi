"use client";
import { useState } from "react";

const clean = (value, length) => String(value || "").replace(/[<>]/g, "").trim().slice(0, length);

export { default as QuoteForm } from "./QuoteForm";

export function ContactForm({ locale = "tr" }) {
  const en = locale === "en";
  const ar = locale === "ar";
  const extras = {
    de:["Ihre E-Mail-Anwendung wurde geöffnet.","Nachricht senden","Vor- und Nachname","Telefon","Betreff","Nachricht","Ich habe den Datenschutzhinweis gelesen.","Nachricht senden"],
    fr:["Votre application de messagerie s’est ouverte.","Envoyez-nous un message","Nom complet","Téléphone","Objet","Message","J’ai lu l’avis de confidentialité.","Envoyer"],
    fa:["برنامه ایمیل شما باز شد.","برای ما پیام بفرستید","نام و نام خانوادگی","تلفن","موضوع","پیام","اطلاعیه حریم خصوصی را خوانده‌ام.","ارسال پیام"]
  };
  const extra = extras[locale];
  const word = (tr, english, arabic, index) => extra ? extra[index] : ar ? arabic : en ? english : tr;
  const [status,setStatus] = useState("");
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = encodeURIComponent(`${en?"Name":"Ad Soyad"}: ${clean(form.get("name"),80)}\n${en?"Phone":"Telefon"}: ${clean(form.get("phone"),20)}\nE-mail: ${clean(form.get("email"),120)}\n\n${clean(form.get("message"),1200)}`);
    window.location.href = `mailto:yozgattercumeofisi66@hotmail.com?subject=${encodeURIComponent(clean(form.get("subject"),120))}&body=${body}`;
    setStatus(word("E-posta uygulamanız açıldı.","Your email application has opened.","تم فتح تطبيق البريد الإلكتروني.",0));
  }
  return <form className="contact-form-wrapper" onSubmit={submit}><h3>{word("Bize Mesaj Gönderin","Send Us a Message","أرسل لنا رسالة",1)}</h3>
    <div className="form-row"><label>{word("Ad soyad","Full name","الاسم الكامل",2)}<input name="name" required/></label><label>{word("Telefon","Telephone","الهاتف",3)}<input name="phone" type="tel" required/></label></div>
    <label>E-mail<input name="email" type="email" required/></label><label>{word("Konu","Subject","الموضوع",4)}<input name="subject" required/></label>
    <label>{word("Mesaj","Message","الرسالة",5)}<textarea name="message" rows="5" required/></label>
    <label className="privacy-check"><input type="checkbox" required/><span>{word("KVKK Aydınlatma Metni’ni okudum.","I have read the privacy notice.","قرأت إشعار الخصوصية.",6)}</span></label>
    <button className="btn btn-primary" type="submit">{word("Mesajı gönder","Send message","إرسال الرسالة",7)}</button><p role="status">{status}</p>
  </form>;
}
