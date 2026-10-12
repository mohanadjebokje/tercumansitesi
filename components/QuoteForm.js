"use client";
import { useEffect, useRef, useState } from 'react';
import { estimateQuote } from '@/config/quote-pricing.mjs';
import { DOCUMENTS, LANGUAGES, SERVICES, validateSelection, validateFileMetadata } from '@/lib/quote-validation.mjs';
import { quoteCopy } from '@/lib/quote-copy.mjs';

export default function QuoteForm({ locale = 'tr' }) {
  const t = quoteCopy(locale);
  const fileInput = useRef(null);
  const [selection, setSelection] = useState({ source: '', target: '', document: '', service: 'sworn', pages: '1' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ kind: '', code: '' });
  const [withAppointment, setWithAppointment] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotState, setSlotState] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [quoteReference, setQuoteReference] = useState('');
  const bookingKey = useRef(null);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  useEffect(() => {
    setTime(''); setSlots([]);
    if (!withAppointment || !date) { setSlotState(''); return; }
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setSlotState('loading');
    fetch(`/api/appointments/availability?date=${date}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(); if (active) { setSlots(data.slots); setSlotState(data.slots.length ? '' : 'empty'); } })
      .catch(() => { if (active) setSlotState('error'); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [withAppointment, date]);
  const busy = status.kind === 'busy';
  const estimate = estimateQuote(selection);
  const change = event => { const { name, value } = event.target; setSelection(old => ({ ...old, [name]: value })); setStatus({ kind: '', code: '' }); };
  const money = amount => new Intl.NumberFormat(locale, { style: 'currency', currency: estimate.currency }).format(amount / 100);
  function chooseFile(event) {
    const next = event.target.files[0];
    setStatus({ kind: '', code: '' });
    if (!next) { setFile(null); return; }
    try { validateFileMetadata(next); setFile(next); }
    catch (error) { setFile(null); event.target.value = ''; setStatus({ kind: 'error', code: error.code }); }
  }
  async function request(url, body) {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(), { code: result.code || 'failed' });
    return result;
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    try {
      const values = new FormData(form);
      const data = validateSelection({ ...selection, email: values.get('email'), privacy: values.get('privacy') === 'on' });
      if (withAppointment && !time) { setStatus({ kind: 'error', code: 'appointment' }); return; }
      if (file) validateFileMetadata(file);
      if (!bookingKey.current) bookingKey.current = crypto.randomUUID();
      const booking = withAppointment ? { fullName: values.get('fullName'), phone: values.get('phone'), date, time, bookingKey: bookingKey.current } : undefined;
      setStatus({ kind: 'busy', code: 'sending' });
      let result;
      if (quoteReference) {
        result = await request('/api/appointments', { ...booking, email: data.email, privacy: data.privacy, service: data.service, notes: `Teklif referansı: ${quoteReference}`, website: values.get('website') });
      } else {
      setStatus({ kind: 'busy', code: 'uploading' });
      let token;
      if (file) {
      const upload = await request('/api/quote-uploads', { ...data, website: values.get('website'), file: { name: file.name, type: file.type, size: file.size } });
      const payload = new FormData();
      Object.entries(upload.fields).forEach(([key, value]) => payload.append(key, value));
      payload.append('file', file);
      const result = await fetch(upload.url, { method: 'POST', body: payload, signal: AbortSignal.timeout(120000) });
      if (!result.ok) throw new Error('upload');
      token = upload.token;
      }
      setStatus({ kind: 'busy', code: 'sending' });
      result = await request('/api/quotes', { ...data, token, appointment: booking, website: values.get('website') });
      if (result.appointmentError) {
        setQuoteReference(result.reference);
        setStatus({ kind: 'partial', code: result.appointmentError });
        return;
      }
      }
      setAppointment(result.appointment || null);
      setQuoteReference(''); bookingKey.current = null;
      setStatus({ kind: 'success', code: '' });
      form.reset(); setFile(null); setWithAppointment(false); setDate(''); setSelection({ source: '', target: '', document: '', service: 'sworn', pages: '1' });
    } catch (error) { setStatus({ kind: quoteReference ? 'partial' : 'error', code: error.code || 'failed' }); }
  }
  return <form className="online-cta-box quote-form" onSubmit={submit} aria-busy={busy}>
    <div className="quote-heading"><h3>{t.title}</h3><p>{t.intro}</p></div>
    <fieldset disabled={busy} className="quote-fields">
      <label>{t.email}<input name="email" type="email" required maxLength={254} autoComplete="email" inputMode="email" dir="ltr" placeholder="ornek@eposta.com"/></label>
      <div className="form-row">{[['source', t.source], ['target', t.target]].map(([name, label]) => <label key={name}>{label}<select name={name} required value={selection[name]} onChange={change}><option value="" disabled>{t.choose}</option>{LANGUAGES.map(([value, text], i) => <option key={value} value={value} disabled={value === selection[name === 'source' ? 'target' : 'source']}>{t.languages?.[i] || text}</option>)}</select></label>)}</div>
      <div className="quote-document-row"><label>{t.document}<select name="document" required value={selection.document} onChange={change}><option value="" disabled>{t.choose}</option>{DOCUMENTS.map((value, i) => <option key={value} value={value}>{t.documents[i]}</option>)}</select></label>
      <label>{t.pages}<select name="pages" required value={selection.pages} onChange={change}>{Array.from({ length: 20 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}<option value="20+">20+</option></select></label></div>
      <fieldset className="quote-notary"><legend>{t.service}</legend><div>{SERVICES.map((value, i) => <label key={value}><input name="service" type="radio" value={value} checked={selection.service === value} onChange={change}/><span>{t.services[i]}</span></label>)}</div></fieldset>
      <div className="quote-upload"><label htmlFor={`quote-file-${locale}`}>{t.upload} <small>(isteğe bağlı)</small><span className="quote-file-hint">{t.fileHint} Belge veya fotoğraf yüklemek zorunlu değildir.</span><input ref={fileInput} id={`quote-file-${locale}`} name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={chooseFile}/></label>{file && <div className="quote-file-info"><span>{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</span><button type="button" onClick={() => { setFile(null); fileInput.current.value = ''; }}>{t.remove}</button></div>}</div>
      <label className="privacy-check"><input type="checkbox" checked={withAppointment} disabled={Boolean(quoteReference)} onChange={event => { setWithAppointment(event.target.checked); bookingKey.current = null; }}/><span>Teklif ile birlikte randevu da almak istiyorum <small>(isteğe bağlı)</small></span></label>
      {withAppointment && <fieldset className="quote-appointment"><legend>20 dakikalık ofis randevusu</legend>
        <div className="form-row"><label>Ad ve soyad<input name="fullName" required minLength={3} maxLength={100} autoComplete="name" onChange={() => { bookingKey.current = null; }}/></label><label>Telefon / WhatsApp<input name="phone" type="tel" required maxLength={25} autoComplete="tel" onChange={() => { bookingKey.current = null; }}/></label></div>
        <label>Randevu tarihi<input type="date" required min={today} value={date} onChange={event => { setDate(event.target.value); bookingKey.current = null; }}/></label>
        <fieldset className="appointment-slots"><legend>Uygun saat · Türkiye saati</legend>
          {!date && <p>Saatleri görmek için bir gün seçin. Hafta sonu kapalıdır.</p>}
          {slotState === 'loading' && <p role="status">Müsait saatler yükleniyor…</p>}
          {slotState === 'error' && <p role="alert">Saatler alınamadı. Başka tarih seçerek yeniden deneyin.</p>}
          {slotState === 'empty' && <p>Bu gün için uygun saat yok. Hafta içi başka bir gün seçin.</p>}
          <div className="appointment-slot-grid">{slots.map(slot => <button type="button" key={slot.time} disabled={!slot.available} aria-pressed={time === slot.time} onClick={() => { setTime(slot.time); bookingKey.current = null; }}>{slot.time}{!slot.available && <small>Dolu</small>}</button>)}</div>
        </fieldset>
        {time && <p className="appointment-selection">{date} · {time}–{slots.find(slot => slot.time === time)?.endTime} · 20 dakika</p>}
      </fieldset>}
      <div className="quote-estimate" aria-live="polite"><span>{t.estimate}</span><strong>{estimate ? money(estimate.total) : t.review}</strong><small>{t.estimated}</small>{selection.pages === '20+' && <small>{t.longDocument}</small>}{selection.service === 'notarized' && (!estimate || estimate.notaryPending) && <small>{t.notary}</small>}</div>
      <label className="privacy-check"><input type="checkbox" name="privacy" required/><span><a href="/kvkk-aydinlatma-metni" target="_blank" rel="noopener noreferrer">{t.privacy}</a></span></label>
      <p className="quote-privacy-note">{t.notice} <a href="/gizlilik-politikasi" target="_blank" rel="noopener noreferrer">{t.policy}</a></p>
      <label className="quote-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
      <button className="btn btn-primary quote-submit" type="submit" disabled={withAppointment && (!time || slotState === 'loading')}>{busy ? t[status.code] : quoteReference ? 'Yalnızca randevuyu yeniden dene' : withAppointment ? 'Teklif Gönder ve Randevu Al' : t.send}<span aria-hidden="true"> →</span></button>
    </fieldset>
    {status.kind && <div className={`quote-status quote-status-${status.kind}`} role={['error', 'partial'].includes(status.kind) ? 'alert' : 'status'}>{status.kind === 'partial' ? `Fiyat teklifiniz gönderildi (${quoteReference}); randevu oluşturulamadı. Başka saat seçip randevuyu yeniden deneyin.` : status.kind === 'error' ? t.errors[status.code] || t.errors.failed : status.kind === 'success' ? t.success : t[status.code]}{appointment && status.kind === 'success' && <p>Randevunuz: {appointment.date} · {appointment.start}–{appointment.end} · Referans: {appointment.reference}</p>}{status.kind === 'error' && <a href="mailto:muhannedcamakci66@gmail.com">muhannedcamakci66@gmail.com</a>}</div>}
  </form>;
}
