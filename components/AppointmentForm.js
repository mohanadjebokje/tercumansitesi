"use client";
import { useEffect, useRef, useState } from 'react';
import { appointmentConfig, appointmentServices } from '@/config/appointments.mjs';
const errors={name:'Ad ve soyadınızı kontrol edin.',email:'Geçerli bir e-posta adresi girin.',phone:'Geçerli telefon / WhatsApp numarası girin.',service:'Hizmet türünü seçin.',notes:'Açıklama en fazla 600 karakter olmalıdır.',privacy:'KVKK aydınlatmasını okuyup ilgili alanı işaretleyin.',date:'Geçerli bir randevu günü seçin.',slot:'Bu saat artık seçilemiyor. Müsait saatleri yenileyin.',taken:'Seçtiğiniz saat az önce başka biri tarafından alındı. Lütfen başka saat seçin.',changed:'Form bilgileri değişti. Lütfen tekrar deneyin.',rate:'Çok fazla deneme yaptınız. Bir süre sonra yeniden deneyin.',unavailable:'Online randevu henüz etkin değil. Lütfen telefonla ulaşın.',database:'Randevu sistemine şu anda ulaşılamıyor. Yeniden deneyin; yanıt alamazsanız randevu oluşturulmuş olabileceği için aynı formdan tekrar deneyin veya ofise ulaşın.',invalid:'Lütfen form bilgilerinizi kontrol edin.',forbidden:'İşlem doğrulanamadı. Lütfen sayfayı yenileyin.'};
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function nextWorkingDay(){
  const day=new Date(`${today()}T12:00:00Z`);
  for(let i=0;i<=appointmentConfig.bookingHorizonDays;i++){
    const date=day.toISOString().slice(0,10);
    if((appointmentConfig.week[day.getUTCDay()||7]||[]).length&&!appointmentConfig.closedDates.includes(date))return date;
    day.setUTCDate(day.getUTCDate()+1);
  }
  return today();
}
export default function AppointmentForm(){
  const [date,setDate]=useState(''); const [slots,setSlots]=useState([]); const [time,setTime]=useState('');
  const [loading,setLoading]=useState(false); const [sending,setSending]=useState(false); const [error,setError]=useState('');
  const [summary,setSummary]=useState(null); const [limits,setLimits]=useState({min:'',max:''}); const [refresh,setRefresh]=useState(0);
  const key=useRef(null); const generation=useRef(0); const formRef=useRef(null);
  useEffect(()=>{setDate(current=>current||nextWorkingDay());},[]);
  useEffect(()=>{
    if(!date)return; const controller=new AbortController(); const current=++generation.current;
    const timeout=setTimeout(()=>controller.abort(),15000);
    setLoading(true);setTime('');setSlots([]);setError('');
    fetch(`/api/appointments/availability?date=${encodeURIComponent(date)}`,{cache:'no-store',signal:controller.signal}).then(async response=>{
      const data=await response.json();if(!response.ok)throw new Error(data.code||'database');
      if(current===generation.current){setSlots(data.slots);setLimits({min:data.min,max:data.max});}
    }).catch(error=>{if(current===generation.current)setError(error.message in errors?error.message:'database');})
      .finally(()=>{clearTimeout(timeout);if(current===generation.current)setLoading(false);});
    return()=>{clearTimeout(timeout);generation.current++;controller.abort();};
  },[date,refresh]);
  // Re-fetch the selected day when the visitor returns to the tab; final authority is the DB transaction.
  useEffect(()=>{const listener=()=>{if(!document.hidden&&!sending&&!summary)setRefresh(n=>n+1);};document.addEventListener('visibilitychange',listener);return()=>document.removeEventListener('visibilitychange',listener);},[sending,summary]);
  async function submit(event){
    event.preventDefault();if(sending||!time)return;setError('');setSending(true);
    const values=new FormData(event.currentTarget);if(!key.current)key.current=crypto.randomUUID();
    const body={fullName:values.get('fullName'),email:values.get('email'),phone:values.get('phone'),service:values.get('service'),notes:values.get('notes'),privacy:values.get('privacy')==='on',website:values.get('website'),date,time,bookingKey:key.current};
    try{
      const response=await fetch('/api/appointments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
      const result=await response.json();if(!response.ok)throw new Error(result.code||'database');
      setSummary(result.appointment);setSlots([]);setTime('');
    }catch(error){const code=error.message in errors?error.message:'database';setError(code);if(['taken','slot'].includes(code)){setTime('');setSlots(old=>old.map(s=>s.time===time?{...s,available:false}:s));}if(code==='changed')key.current=null;}
    finally{setSending(false);}
  }
  const selected=slots.find(slot=>slot.time===time);
  const closed=date&&(!(appointmentConfig.week[new Date(`${date}T12:00:00Z`).getUTCDay()||7]||[]).length||appointmentConfig.closedDates.includes(date));
  if(summary)return <section className="appointment-card appointment-success" role="status"><span className="appointment-success-icon" aria-hidden="true">✓</span><h2>Randevunuz oluşturuldu</h2><p>Referans numaranızı saklayın.</p><strong className="appointment-reference">{summary.reference}</strong><dl><div><dt>Tarih</dt><dd>{summary.date}</dd></div><div><dt>Saat</dt><dd>{summary.start}–{summary.end} · 20 dakika</dd></div><div><dt>Hizmet</dt><dd>{summary.service}</dd></div><div><dt>Saat dilimi</dt><dd>Europe/Istanbul (Türkiye)</dd></div></dl><p>Ofis ve müşteri e-posta bildirimleri gönderim kuyruğuna alındı. E-posta ulaşmasa da randevunuz kayıtlıdır.</p><p>İptal veya değişiklik için referansınızla <a href="tel:+905325117544">0532 511 75 44</a> numarasından ulaşın.</p><a className="btn btn-primary" href="/">Ana sayfaya dön</a></section>;
  return <form className="appointment-card" ref={formRef} onSubmit={submit} onChange={()=>{if(!sending)key.current=null;}} aria-busy={sending}><div className="appointment-card-heading"><span>20 DAKİKALIK OFİS GÖRÜŞMESİ</span><h2>Online randevu alın</h2><p>Önce günü, ardından müsait saati seçin.</p></div>
    <fieldset disabled={sending} className="appointment-fields"><label>Randevu tarihi<input name="date" type="date" value={date} min={limits.min||today()} max={limits.max||undefined} required onChange={event=>setDate(event.target.value)}/></label>
      <fieldset className="appointment-slots"><legend>Uygun saat · Türkiye saati</legend>{loading?<p role="status">Müsait saatler yükleniyor…</p>:slots.length?<div className="appointment-slot-grid">{slots.map(slot=><button key={slot.time} type="button" disabled={!slot.available} aria-pressed={time===slot.time} aria-label={`${slot.time}${slot.available?'':' Dolu'}`} onClick={()=>{key.current=null;setTime(slot.time);setError('');}}>{slot.time}{!slot.available&&<small>Dolu</small>}</button>)}</div>:<p>{!date?'Saatleri görmek için tarih seçin.':error?'Müsait saatler alınamadı. Saatleri yenileyin.':closed?'Seçtiğiniz gün ofis kapalı. Hafta içi bir gün seçin.':'Bu gün için seçilebilir saat kalmadı. Lütfen başka gün seçin.'}</p>}<button className="appointment-refresh" type="button" onClick={()=>setRefresh(n=>n+1)} disabled={loading}>Saatleri yenile</button></fieldset>
      {selected&&<div className="appointment-selection" role="status">{date} · {selected.time}–{selected.endTime} · <b>20 dakika</b><small>Europe/Istanbul</small></div>}
      <label>Ad ve soyad<input name="fullName" required minLength={3} maxLength={100} autoComplete="name" placeholder="Adınız ve soyadınız"/></label><div className="appointment-contact-row"><label>E-posta adresiniz<input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="ornek@eposta.com"/></label><label>Telefon / WhatsApp<input name="phone" type="tel" required maxLength={25} autoComplete="tel" placeholder="05xx xxx xx xx"/></label></div>
      <label>Hizmet türü<select name="service" required defaultValue=""><option value="" disabled>Hizmet seçiniz</option>{Object.entries(appointmentServices).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label>Açıklama <small>(isteğe bağlı)</small><textarea name="notes" rows={2} maxLength={600} placeholder="Görüşme konunuzu kısaca yazabilirsiniz. Belge veya hassas kişisel bilgi eklemeyin."/></label>
      <label className="appointment-privacy"><input type="checkbox" name="privacy" required/><span><a href="/kvkk-aydinlatma-metni" target="_blank" rel="noopener noreferrer">KVKK Aydınlatma Metni’ni</a> okudum.</span></label><p className="appointment-privacy-note">Bilgileriniz randevunun planlanması ve bildirimleri için kullanılır. <a href="/gizlilik-politikasi" target="_blank" rel="noopener noreferrer">Gizlilik Politikası</a></p>
      <label className="appointment-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><button className="btn btn-primary" type="submit" disabled={!time||loading}>{sending?'Randevu kaydediliyor…':'Randevumu oluştur'}</button>
    </fieldset>{error&&<div className="appointment-error" role="alert">{errors[error]||errors.database}<a href="tel:+905325117544">Telefonla ulaşın: 0532 511 75 44</a></div>}</form>;
}
