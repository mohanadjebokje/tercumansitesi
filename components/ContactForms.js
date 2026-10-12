"use client";
import { useState } from "react";

const clean = (value, length) => String(value || "").replace(/[<>]/g, "").trim().slice(0, length);

export function QuoteForm({ locale = "tr" }) {
  const en = locale === "en";
  const ar = locale === "ar";
  const extras = {
    de:["Übersetzungsangebot","Ausgangssprache","Zielsprache","Dokument","Jetzt Angebot erhalten","Dokument- und Zielsprache auswählen.","Dokumentsprache","Auswählen","Zielsprache","Dokumentart","Diplom, Reisepass, Vertrag...","Ich habe den Datenschutzhinweis gelesen und stimme der Verarbeitung zur Angebotserstellung zu.","Angebot per E-Mail anfordern"],
    fr:["Devis de traduction","Langue source","Langue cible","Document","Obtenir un devis","Sélectionnez les langues du document et de destination.","Langue du document","Sélectionner","Langue cible","Type de document","Diplôme, passeport, contrat...","J’ai lu l’avis de confidentialité et j’accepte le traitement pour le devis.","Demander par e-mail"],
    fa:["درخواست قیمت ترجمه","زبان مبدأ","زبان مقصد","مدرک","همین حالا قیمت بگیرید","زبان مدرک و زبان مقصد را انتخاب کنید.","زبان مدرک","انتخاب","زبان مقصد","نوع مدرک","مدرک، گذرنامه، قرارداد...","اطلاعیه حریم خصوصی را خوانده‌ام و با پردازش اطلاعات برای قیمت‌گذاری موافقم.","درخواست قیمت با ایمیل"]
  };
  const extra = extras[locale];
  const word = (tr, english, arabic, index) => extra ? extra[index] : ar ? arabic : en ? english : tr;
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`${word("Çeviri fiyat talebi","Translation quote","طلب عرض سعر للترجمة",0)}: ${clean(form.get("document"), 80)}`);
    const body = encodeURIComponent(`${word("Kaynak dil","Source language","لغة الوثيقة",1)}: ${form.get("source")}\n${word("Hedef dil","Target language","اللغة المطلوبة",2)}: ${form.get("target")}\n${word("Belge","Document","الوثيقة",3)}: ${clean(form.get("document"),80)}`);
    window.location.href = `mailto:yozgattercumeofisi66@hotmail.com?subject=${subject}&body=${body}`;
  }
  return <form className="online-cta-box" onSubmit={submit}>
    <h3>{word("Hemen Fiyat Teklifi Alın","Get a Quote Now","احصل على عرض سعر الآن",4)}</h3>
    <p>{word("Belge ve hedef çeviri dilini seçin.","Select the document and target languages.","اختر لغة الوثيقة واللغة المطلوبة.",5)}</p>
    <label>{word("Belge dili","Document language","لغة الوثيقة",6)}<select name="source" required defaultValue=""><option value="" disabled>{word("Seçiniz","Select","اختر",7)}</option><option>Türkçe</option><option>English</option><option>Deutsch</option><option>العربية</option><option>Français</option><option>فارسی</option></select></label>
    <label>{word("Hedef dil","Target language","اللغة المطلوبة",8)}<select name="target" required defaultValue=""><option value="" disabled>{word("Seçiniz","Select","اختر",7)}</option><option>Türkçe</option><option>English</option><option>Deutsch</option><option>العربية</option><option>Français</option><option>فارسی</option></select></label>
    <label>{word("Belge türü","Document type","نوع الوثيقة",9)}<input name="document" required maxLength="80" placeholder={word("Diploma, pasaport, sözleşme...","Diploma, passport, contract...","شهادة، جواز سفر، عقد...",10)}/></label>
    <label className="privacy-check"><input type="checkbox" required/><span>{word("KVKK Aydınlatma Metni’ni okudum; bilgilerimin teklif amacıyla işlenmesini kabul ediyorum.","I have read the privacy notice and consent to processing for a quote.","قرأت إشعار الخصوصية وأوافق على معالجة معلوماتي لغرض إعداد العرض.",11)}</span></label>
    <button className="btn btn-primary" type="submit">{word("E-posta ile fiyat sor","Request quote by email","اطلب عرضاً عبر البريد",12)}</button>
  </form>;
}

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
