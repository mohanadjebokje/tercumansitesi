import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppointmentForm from '@/components/AppointmentForm';
import { appointmentConfig, appointmentCalendarSummary } from '@/config/appointments.mjs';
export const metadata={ title:'Online Randevu',description:'Tercüme, noter onaylı tercüme ve belge teslimi için 20 dakikalık ofis randevusu alın.',alternates:{canonical:'/randevu'} };
export default function Page(){
  return <><Header/><main className="appointment-page"><div className="container appointment-layout"><aside className="appointment-intro"><span className="online-badge">ONLINE RANDEVU</span><h1>Ofis ziyaretinizi<br/>birlikte planlayalım.</h1><p>Gününüzü seçin, müsait saatleri görün. Her görüşme için size 20 dakika ayırıyoruz.</p><div className="appointment-facts"><div><b>20 dakika</b><span>Her randevu için ayrılan süre</span></div><div><b>Türkiye saati</b><span>Europe/Istanbul</span></div><div><b>Çalışma takvimi</b>{appointmentCalendarSummary().map(line=><span key={line}>{line}</span>)}</div></div>{!appointmentConfig.calendarApproved&&<p className="appointment-sample">Bu çalışma saatleri başlangıç için örnek takvimdir; gerçek ofis takvimi henüz onaylanmamıştır.</p>}<a href="tel:+905325117544">Sorularınız için: 0532 511 75 44</a></aside><AppointmentForm/></div></main><Footer/></>;
}
