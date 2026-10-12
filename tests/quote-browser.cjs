// Run against the local preview only. No real documents or email are sent.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const origin = process.env.QUOTE_TEST_ORIGIN || 'http://localhost:3000';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  // Third-party map is unrelated to the quote form and can delay local QA.
  await page.route('**/maps.google.com/**', route => route.abort());
  page.on('pageerror', error => console.error('Browser runtime:', error.message));
  await page.goto(`${origin}/#online-support`, { waitUntil: 'networkidle' });
  const form = page.locator('.quote-form');
  await form.waitFor();
  assert.equal(await page.locator('.step-item').count(), 4);
  assert.equal(await form.locator('[name=source] option').count(), 10);
  assert.equal(await form.locator('[name=document] option').count(), 11);
  assert.equal(await form.locator('[name=pages] option').count(), 21);
  assert.equal(await form.locator('[name=service]').count(), 2);
  assert.equal(await form.locator('[name=privacy]').isChecked(), false);
  assert.match(await form.locator('button[type=submit]').innerText(), /Ücretsiz/);
  await form.locator('[name=email]').fill('qa@example.com');
  await form.locator('[name=source]').selectOption('tr');
  await page.waitForFunction(() => document.querySelector('.quote-form [name=target] option[value=tr]').disabled);
  assert.equal(await form.locator('[name=target] option[value=tr]').evaluate(option => option.disabled), true);
  await form.locator('[name=target]').selectOption('en');
  await form.locator('[name=document]').selectOption('passport');
  await form.locator('[name=pages]').selectOption('20+');
  assert.match(await form.locator('.quote-estimate').innerText(), /20 sayfadan/);
  await form.locator('[name=service][value=notarized]').check();
  assert.match(await form.locator('.quote-estimate').innerText(), /Noter masrafları ayrıca hesaplanır/);
  for (const mb of [2, 5]) {
    const bytes = Buffer.alloc(mb * 1024 * 1024, 32); bytes.write('%PDF-1.4'); bytes.write('%%EOF', bytes.length - 5);
    await form.locator('[name=file]').setInputFiles({ name: `qa-${mb}mb.pdf`, mimeType: 'application/pdf', buffer: bytes });
    assert.match(await form.locator('.quote-file-info').innerText(), new RegExp(`${mb}\\.00 MB`));
  }
  await form.locator('[name=file]').setInputFiles({ name: 'oversized.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
  assert.match(await form.locator('[role=alert]').innerText(), /5 MB/);
  await form.locator('[name=file]').setInputFiles({ name: 'invalid.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('MZ') });
  assert.match(await form.locator('[role=alert]').innerText(), /PDF/);
  const bytes = Buffer.alloc(2 * 1024 * 1024, 32); bytes.write('%PDF-1.4'); bytes.write('%%EOF', bytes.length - 5);
  await form.locator('[name=file]').setInputFiles({ name: 'qa.pdf', mimeType: 'application/pdf', buffer: bytes });
  await form.locator('[name=privacy]').check();
  await form.locator('button[type=submit]').click();
  await form.locator('.quote-status-error').waitFor();
  assert.match(await form.locator('.quote-status-error').innerText(), /henüz etkin değil/);
  assert.equal(await form.locator('.quote-status-success').count(), 0);
  const sourceDesktop = await form.locator('[name=source]').boundingBox();
  const targetDesktop = await form.locator('[name=target]').boundingBox();
  assert.equal(Math.round(sourceDesktop.y), Math.round(targetDesktop.y));
  await page.locator('#online-support').screenshot({ path: path.join(os.tmpdir(), 'quote-desktop.png'), style: '.main-header,.fixed-whatsapp,nextjs-portal{visibility:hidden!important}' });
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const [a, b] = await form.evaluate(el => ['source', 'target'].map(name => {
      const rect = el.querySelector(`[name=${name}]`).getBoundingClientRect();
      return { y: rect.top, height: rect.height };
    }));
    assert(b.y > a.y + a.height, JSON.stringify({ width, a, b, grid: await form.locator('.form-row').evaluate(el => getComputedStyle(el).gridTemplateColumns) }));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  }
  await form.screenshot({ path: path.join(os.tmpdir(), 'quote-mobile.png'), style: '.main-header,.fixed-whatsapp,nextjs-portal{visibility:hidden!important}' });
  console.log('PASS: form order/options, 4 original steps, 2/5 MB upload, error states, unavailable-service handling, desktop and 320/390px layout.');
  console.log(`Screenshots: ${path.join(os.tmpdir(), 'quote-desktop.png')}, ${path.join(os.tmpdir(), 'quote-mobile.png')}`);
  // HTTP mocks verify the combined UI contract without sending real email.
  assert.equal(await form.locator('[name=file]').getAttribute('required'), null);
  let requests = [];
  await page.route('**/api/quotes', route => {
    const body = route.request().postDataJSON(); requests.push(body);
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, reference: 'QUOTE-TEST', ...(body.appointment ? { appointmentError: 'taken' } : {}) }) });
  });
  async function fillQuote() {
    await form.locator('[name=file]').setInputFiles([]);
    await form.locator('[name=email]').fill('preview@example.com');
    await form.locator('[name=source]').selectOption('tr');
    await form.locator('[name=target]').selectOption('en');
    await form.locator('[name=document]').selectOption('passport');
    await form.locator('[name=privacy]').check();
  }
  await fillQuote();
  await form.locator('button[type=submit]').click();
  await form.locator('.quote-status-success').waitFor();
  assert.equal(requests[0].token, undefined);
  assert.equal(requests[0].appointment, undefined);
  await fillQuote();
  await form.getByLabel(/Teklif ile birlikte randevu/).check();
  await form.locator('[name=fullName]').fill('Test Customer');
  await form.locator('[name=phone]').fill('+905320000000');
  const future = new Date(); future.setUTCDate(future.getUTCDate() + 1);
  while ([0,6].includes(future.getUTCDay())) future.setUTCDate(future.getUTCDate() + 1);
  await form.locator('.quote-appointment input[type=date]').fill(future.toISOString().slice(0,10));
  await form.locator('.appointment-slot-grid button:not(:disabled)').first().click();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await form.locator('button[type=submit]').click();
  await form.locator('.quote-status-partial').waitFor();
  assert.equal(requests.length, 2);
  assert.equal(requests[1].appointment.fullName, 'Test Customer');
  assert(requests[1].appointment.time);
  await page.route('**/api/appointments', route => route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,appointment:{reference:'RND-TEST',date:'Test date',start:'09:00',end:'09:20'}})}));
  await form.locator('button[type=submit]').click();
  await form.locator('.quote-status-success').waitFor();
  assert.match(await form.locator('.quote-status-success').innerText(), /RND-TEST/);
  assert.equal(requests.length, 2, 'Retry must not send the quote again');
  console.log('PASS: optional file; quote-only; optional real availability; combined payload; partial failure; appointment-only retry. Email responses mocked.');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
