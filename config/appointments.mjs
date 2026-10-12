export const appointmentConfig = {
  timeZone: 'Europe/Istanbul',
  durationMinutes: 20,
  calendarApproved: false, // Sample schedule. Confirm the real office calendar before production.
  bookingHorizonDays: 60,
  week: {
    1: [['09:00', '12:00'], ['13:00', '17:00']],
    2: [['09:00', '12:00'], ['13:00', '17:00']],
    3: [['09:00', '12:00'], ['13:00', '17:00']],
    4: [['09:00', '12:00'], ['13:00', '17:00']],
    5: [['09:00', '12:00'], ['13:00', '17:00']],
    6: [], 7: [],
  },
  closedDates: [], // YYYY-MM-DD: holidays and office closures
};
export const appointmentServices = {
  sworn: 'Yeminli tercüme', notarized: 'Noter onaylı tercüme',
  delivery: 'Belge teslimi', consultation: 'Belge danışmanlığı', other: 'Diğer',
};
export function appointmentCalendarSummary(config=appointmentConfig){
  const labels=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']; const groups=new Map();
  for(let day=1;day<=7;day++){
    const text=(config.week[day]||[]).map(pair=>pair.join('–')).join(' / ')||'Kapalı';
    if(!groups.has(text))groups.set(text,[]);groups.get(text).push(day);
  }
  return [...groups].map(([hours,days])=>{
    const consecutive=days.every((day,i)=>i===0||day===days[i-1]+1);
    const range=days.length>1&&consecutive?`${labels[days[0]-1]}–${labels[days.at(-1)-1]}`:days.map(day=>labels[day-1]).join(', ');
    return `${range}: ${hours}`;
  });
}
