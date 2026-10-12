const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const path=require('node:path');const os=require('node:os');
const origin=process.env.APPOINTMENT_TEST_ORIGIN||'http://localhost:3000';
const admin=process.env.APPOINTMENT_TEST_ADMIN_TOKEN;
(async()=>{
  if(!admin)throw new Error('Provide the local-only admin token to clean up synthetic test bookings.');
  const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1200}});
  const references=[];
  const cancel=reference=>page.request.post(`${origin}/api/appointments/admin`,{headers:{Authorization:`Bearer ${admin}`},data:{action:'cancel',reference}});
  try{
    await page.goto(`${origin}/randevu`,{waitUntil:'networkidle'});
    const date=new Date(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())+'T12:00:00Z');
    do{date.setUTCDate(date.getUTCDate()+1);}while([0,6].includes(date.getUTCDay()));
    const day=date.toISOString().slice(0,10);await page.locator('[name=date]').fill(day);
    await page.waitForFunction(()=>document.querySelectorAll('.appointment-slot-grid button').length===21);
    assert.equal(await page.locator('[name=privacy]').isChecked(),false);
    await page.locator('.appointment-slot-grid button').first().click();
    assert.match(await page.locator('.appointment-selection').innerText(),/20 dakika/);
    await page.locator('[name=fullName]').fill('Yerel Test Müşteri');await page.locator('[name=email]').fill('local-test@example.com');await page.locator('[name=phone]').fill('+905320000000');await page.locator('[name=service]').selectOption('sworn');await page.locator('[name=privacy]').check();
    await page.getByRole('button',{name:'Randevumu oluştur'}).click();await page.locator('.appointment-reference').waitFor();
    const reference=await page.locator('.appointment-reference').innerText();references.push(reference);
    assert.match(reference,/^RND-[A-F0-9]{16}$/);assert.match(await page.locator('.appointment-success').innerText(),/09:00–09:20/);
    await page.reload({waitUntil:'networkidle'});await page.locator('[name=date]').fill(day);
    await page.getByRole('button',{name:'09:00 Dolu',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'09:00 Dolu',exact:true}).isDisabled(),true);
    assert.equal(await page.getByRole('button',{name:'09:20',exact:true}).isEnabled(),true);
    const body={fullName:'Eşzamanlı Test',email:'race@example.com',phone:'+905320000000',service:'delivery',date:day,time:'09:20',privacy:true,notes:''};
    const attempts=await Promise.all([1,2].map(()=>page.request.post(`${origin}/api/appointments`,{headers:{Origin:origin},data:{...body,bookingKey:randomUUID()}})));
    assert.deepEqual(attempts.map(r=>r.status()).sort(),[201,409]);const booked=await attempts.find(r=>r.status()===201).json();references.push(booked.appointment.reference);
    await cancel(reference);await page.getByRole('button',{name:'Saatleri yenile'}).click();await page.getByRole('button',{name:'09:00',exact:true}).waitFor();
    assert.equal(await page.getByRole('button',{name:'09:00',exact:true}).isEnabled(),true);
    await page.locator('.appointment-layout').screenshot({path:path.join(os.tmpdir(),'appointments-desktop.png'),style:'.main-header,nextjs-portal{visibility:hidden!important}'});
    for(const width of [320,390]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
    await page.locator('.appointment-card').screenshot({path:path.join(os.tmpdir(),'appointments-mobile.png'),style:'.main-header,nextjs-portal{visibility:hidden!important}'});
    console.log('PASS: real local booking, reference, persisted occupied slot, API race (201/409), cancellation, desktop and 320/390px mobile.');
    // Simulate a lost DB connection at the HTTP boundary: no invented slots or success.
    await page.route('**/api/appointments/availability?**',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,code:'database'})}));
    await page.getByRole('button',{name:'Saatleri yenile'}).click();await page.locator('.appointment-error[role=alert]').waitFor();assert.equal(await page.locator('.appointment-slot-grid button').count(),0);
    console.log('PASS: connection-failure UX shows an error and no availability.');
  }finally{for(const reference of references)await cancel(reference);await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
