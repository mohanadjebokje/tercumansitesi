import { redirect } from 'next/navigation';

export default function AppointmentPage() {
  redirect('/?randevu=1#online-support');
}
